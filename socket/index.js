module.exports= function (io){
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

const handleNickname=(socket,nickname)=>{
        nickname= nickname?.trim()||'Guest'
        onlineUsers[socket.id]=nickname
}

const handleJoinRoom=(socket,roomName)=>{
       if(!validRooms.has(roomName.toLowerCase())){
        socket.emit('errorMsg',`Invalid room. Allowed Rooms are ${[...validRooms].join(", ")}`)
       return;
    }
    if(socket.currentRoom){
        socket.leave(socket.currentRoom);
        if(roomUsers[socket.currentRoom]){
            delete roomUsers[socket.currentRoom][socket.id];
            io.to(socket.currentRoom).emit('onlineUsers',Object.values(roomUsers[socket.currentRoom]))
        }
    }
    socket.join(roomName);
    socket.currentRoom=roomName;

    if(!roomUsers[roomName]) roomUsers[roomName]={};
    roomUsers[roomName][socket.id]=onlineUsers[socket.id]||'GUEST'

    io.to(roomName).emit('onlineUsers',Object.values(roomUsers[roomName]));

const joinMsg = formatMessage('System', `${onlineUsers[socket.id]} has joined the chat`, true);

if (!roomMessages[roomName]) roomMessages[roomName] = [];

roomMessages[roomName].push(joinMsg);


socket.emit('chatHistory',roomMessages[roomName]);

socket.broadcast.to(roomName).emit('chatMessage',joinMsg);
    

}

const handleChatMessage=(socket,msg)=>{
   if(!socket.currentRoom) return;

    if(!roomMessages[socket.currentRoom]) roomMessages[socket.currentRoom]=[];
    
    const payload= formatMessage(onlineUsers[socket.id]||'GUEST',msg.text)

    roomMessages[socket.currentRoom].push(payload)
    
    io.to(socket.currentRoom).emit('chatMessage',payload);
}

const handleTyping=(socket)=>{
    if(socket.currentRoom) socket.broadcast.to(socket.currentRoom).emit('typing',onlineUsers[socket.id])
}


const handleStopTyping=(socket)=>{
    if(socket.currentRoom) socket.broadcast.to(socket.currentRoom).emit('stopTyping',onlineUsers[socket.id]);
}

const handleDisconnect=(socket)=>{
    const username= onlineUsers[socket.id] || 'Guest'
    delete onlineUsers[socket.id];

    if(socket.currentRoom && roomUsers[socket.currentRoom]){
        delete roomUsers[socket.currentRoom][socket.id]
      
        io.to(socket.currentRoom).emit('onlineUsers',Object.values(roomUsers[socket.currentRoom]));
        const leaveMsg= formatMessage(username,`${username} has left the chat ...`,true);
        io.to(socket.currentRoom).emit('chatMessage',leaveMsg)
    }
    if (socket.currentRoom && roomUsers[socket.currentRoom] && Object.keys(roomUsers[socket.currentRoom]).length === 0) {
        delete roomMessages[socket.currentRoom];
        delete roomUsers[socket.currentRoom];
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