const user = require('../models/user');

module.exports= function (io){
const jwt=require('jsonwebtoken')
const AppError = require('../utils/appError.js');

const onlineUsers={};
const roomUsers = {};
const roomMessages = {
    SPORTS: [],
    TECH: [],
    GENERAL: []
};

const formatMessage = (user, text, isSystem = false) => ({
        user,
        text,
        time: new Date().toISOString(),
        isSystem
});
const validRooms=new Set(['sports','general','tech'])


io.use((socket,next)=>{
    const token= socket.handshake.auth?.token;
    
    if(!token) return next(new AppError("No Token",401,"AuthError"))
    
    try{
        const decoded= jwt.verify(token,process.env.JWT_SECRET);

        socket.user={userId:decoded.id,username:decoded.username};
        return next();

    }catch(err){
        return next(new AppError('Invalid Token',403,"AuthError"))
    }
})


// const handleNickname=(socket,nickname)=>{
    
//         nickname= nickname?.trim()||socket.user.username||'Guest'
//         onlineUsers[socket.id]=nickname
        
// }

const handleNickname=(socket,nickname)=>{
    const userId=socket.user.userId;
    console.log('Userid is ',userId);
    const username= nickname?.trim() ||socket.user.username?.trim()||'Guest';
    console.log('handleNickname username is ',username)
    
    if(!onlineUsers[userId]) onlineUsers[userId]={username,sockets:new Set()};
    onlineUsers[userId].sockets.add(socket.id);
    console.log('fromHandleNickname',onlineUsers)

}

// const handleJoinRoom=(socket,roomName)=>{
//        if(!validRooms.has(roomName.toLowerCase())){
//         socket.emit('errorMsg',`Invalid room. Allowed Rooms are ${[...validRooms].join(", ")}`)
//        return;
//     }
//     if(socket.currentRoom){
//         socket.leave(socket.currentRoom);
//         if(roomUsers[socket.currentRoom]){
//             delete roomUsers[socket.currentRoom][socket.id];
//             io.to(socket.currentRoom).emit('onlineUsers',Object.values(roomUsers[socket.currentRoom]))
//         }
//     }
//     socket.join(roomName);
//     socket.currentRoom=roomName;

//     if(!roomUsers[roomName]) roomUsers[roomName]={};
//     roomUsers[roomName][socket.id]=onlineUsers[socket.id]||'GUEST'

//     io.to(roomName).emit('onlineUsers',Object.values(roomUsers[roomName]));

//     const joinMsg = formatMessage('System', `${onlineUsers[socket.id]} has joined the chat`, true);

//     if (!roomMessages[roomName]) roomMessages[roomName] = [];

//     roomMessages[roomName].push(joinMsg);


//     socket.emit('chatHistory',roomMessages[roomName]);

//     socket.broadcast.to(roomName).emit('chatMessage',joinMsg);
    

// }
const handleJoinRoom = (socket, roomName) => {
    roomName = roomName.toLowerCase();

    
    if (!validRooms.has(roomName)) {
        socket.emit('errorMsg', `Invalid room. Allowed rooms are ${[...validRooms].join(", ")}`);
        return;
    }

    
    if (socket.currentRoom) {
        const oldRoom = socket.currentRoom;
        socket.leave(oldRoom);

        if (roomUsers[oldRoom]?.[socket.user.userId]) {
            const userEntry = roomUsers[oldRoom][socket.user.userId];
            userEntry.sockets.delete(socket.id);

            // Remove user from room if no sockets left
            if (userEntry.sockets.size === 0) {
                delete roomUsers[oldRoom][socket.user.userId];
                const leaveMsg = formatMessage('System', `${userEntry.username} has left the chat`, true);
                io.to(oldRoom).emit('chatMessage', leaveMsg);
            }
            io.to(oldRoom).emit('onlineUsers', Object.values(roomUsers[oldRoom]).map(u => u.username));
        }
    }

    //  Join new room
    socket.join(roomName);
    socket.currentRoom = roomName;

    if (!roomUsers[roomName]) roomUsers[roomName] = {};
    if (!roomUsers[roomName][socket.user.userId]) {
        roomUsers[roomName][socket.user.userId] = {
            username: onlineUsers[socket.user.userId].username,
            sockets: new Set()
        };
    }

    roomUsers[roomName][socket.user.userId].sockets.add(socket.id);

    //  Send online users list

    io.to(roomName).emit('onlineUsers', Object.values(roomUsers[roomName]).map(u => u.username));

    //  Send system "joined" message only if first tab joins
    if (roomUsers[roomName][socket.user.userId].sockets.size === 1) {
        const username = onlineUsers[socket.user.userId].username;
        const joinMsg = formatMessage('System', `${username} has joined the chat`, true);

        if (!roomMessages[roomName]) roomMessages[roomName] = [];
        roomMessages[roomName].push(joinMsg);

        socket.broadcast.to(roomName).emit('chatMessage', joinMsg);
    }

    // Send chat history to this socket
    socket.emit('chatHistory', roomMessages[roomName] || []);
}


const handleChatMessage=(socket,msg)=>{
   if(!socket.currentRoom) return;

    if(!roomMessages[socket.currentRoom]) roomMessages[socket.currentRoom]=[];
    
    const username= onlineUsers[socket.user.userId]?.username||'Guest'
    const payload= formatMessage(username,msg.text)

    roomMessages[socket.currentRoom].push(payload)
    
    io.to(socket.currentRoom).emit('chatMessage',payload);
}

const handleTyping=(socket)=>{
    if(socket.currentRoom) socket.broadcast.to(socket.currentRoom).emit('typing',onlineUsers[socket.id])
}


const handleStopTyping=(socket)=>{
    if(socket.currentRoom) socket.broadcast.to(socket.currentRoom).emit('stopTyping',onlineUsers[socket.id]);
}

// const handleDisconnect=(socket)=>{
//     const userId=socket.user.userId
//     const username= onlineUsers[socket.id] || 'Guest'
//     delete onlineUsers[socket.id];

//     if(socket.currentRoom && roomUsers[socket.currentRoom]){
//         delete roomUsers[socket.currentRoom][socket.id]
      
//         io.to(socket.currentRoom).emit('onlineUsers',Object.values(roomUsers[socket.currentRoom]));
//         const leaveMsg= formatMessage(username,`${username} has left the chat ...`,true);
//         io.to(socket.currentRoom).emit('chatMessage',leaveMsg)
//     }
//     if (socket.currentRoom && roomUsers[socket.currentRoom] && Object.keys(roomUsers[socket.currentRoom]).length === 0) {
//         delete roomMessages[socket.currentRoom];
//         delete roomUsers[socket.currentRoom];
//     }


// }


const handleDisconnect= (socket)=>{
    const userId= socket.user.userId;
    const username=onlineUsers[userId]?.username|| 'Guest';

    if(onlineUsers[userId]){
        onlineUsers[userId].sockets.delete(socket.id);

        if(onlineUsers[userId].sockets.size===0){
            delete onlineUsers[userId];
        }
    }

    const room=socket.currentRoom;
    if(room && roomUsers[room]?.[userId]){
        const userEntry= roomUsers[room][userId];
        userEntry.sockets.delete(socket.id);

        if(userEntry.sockets.size===0){
            delete roomUsers[room][userId];

            const leaveMsg= formatMessage('System',`${username} has left the chat...`,true)
            io.to(room).emit('chatMessage',leaveMsg)
        }
        io.to(room).emit('onlineUsers',Object.values(roomUsers[room]||{}).map(u=>u.username));
    }
}


    io.on('connection',(socket)=>
        {
       
        socket.on('nickname',(nickname)=>handleNickname(socket,nickname))
        socket.on('joinRoom',(roomName)=>handleJoinRoom(socket,roomName))
        socket.on('chatMessage',(msg)=>handleChatMessage(socket,msg))
        socket.on('typing',()=>handleTyping(socket))
        socket.on('stopTyping',()=>handleStopTyping(socket))
        socket.on('disconnect',()=>handleDisconnect(socket))
    })
}

