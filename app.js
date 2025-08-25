const express= require('express');
const app=express();

const http= require('http');
const server= http.createServer(app);

const {Server}=require('socket.io');
const io= new Server(server);

app.use(express.static(__dirname + '/public'))

let onlineUsers={}
let roomUsers={}

let roomMessages={
    SSRF:[],
    XSS:[],
    CPDOS:[]
}

const validRooms=new Set(['SSRF','XSS','CPDOS']);


io.on('connection',(socket)=>{
    
    socket.on('nickname',(nickname)=>{
        if(!nickname|| nickname.trim()===''){
            nickname='Guest';
        }
        nickname=nickname.trim().slice(0,20)
       
        onlineUsers[socket.id]=nickname||'Guest';
    
    })  

    socket.on('joinRoom',(roomName)=>{
        if(!validRooms.has(roomName)){
            socket.emit('errorMsg',`Invalid room.Allowed rooms are:-${[...validRooms].join(", ")}`)
            return
        }

        if(socket.currentRoom){
            socket.leave(socket.currentRoom);
            if(roomUsers[socket.currentRoom]){
                delete roomUsers[socket.currentRoom][socket.id];
                io.to(socket.currentRoom).emit('onlineUsers',Object.values(roomUsers[socket.currentRoom]))
            }

        }
        socket.join(roomName)
       
        socket.currentRoom=roomName;

        if(!roomUsers[roomName]) roomUsers[roomName]={};
        roomUsers[roomName][socket.id]=onlineUsers[socket.id]|| "Guest"
      
        io.to(roomName).emit('onlineUsers',Object.values(roomUsers[roomName]))
        
        if(roomMessages[roomName]){
            socket.emit('chatHistory',roomMessages[roomName])
        }

        const joinMsg = {
            user: "System",
            text: `${onlineUsers[socket.id]} has joined the chat`,
            time: new Date().toISOString(),
            isSystem: true
        };

        roomMessages[roomName]?.push(joinMsg);

        io.to(roomName).emit('chatMessage', joinMsg);

    })

    socket.on('chatMessage',(msg)=>{
        if (!socket.currentRoom) return;
        
        if(!roomMessages[socket.currentRoom]){
            roomMessages[socket.currentRoom]=[];
        }

        const payload={
            user:onlineUsers[socket.id] ||'Guest',
            text: msg.text,
            time:new Date().toISOString()
        };

        roomMessages[socket.currentRoom].push(payload);
        io.to(socket.currentRoom).emit('chatMessage',payload)
    })

    socket.on('typing',()=>{
        if(socket.currentRoom){
            socket.broadcast.to(socket.currentRoom).emit('typing',onlineUsers[socket.id]);
        }
    })

    socket.on('stopTyping',()=>{
        if(socket.currentRoom){
            socket.broadcast.to(socket.currentRoom).emit('stopTyping', onlineUsers[socket.id]);
        }
    })


    socket.on('disconnect',()=>{
        const username=onlineUsers[socket.id]||'Guest';
         

        delete onlineUsers[socket.id];
        if (socket.currentRoom && roomUsers[socket.currentRoom]){
            
            delete roomUsers[socket.currentRoom][socket.id];
            io.to(socket.currentRoom).emit('onlineUsers',Object.values(roomUsers[socket.currentRoom]))
            const leaveMsg={
                user:username,
                text:   `${username} has left the chat`,
                time: new Date().toISOString(),
                isSystem:true
            }
            io.to(socket.currentRoom).emit('chatMessage',leaveMsg)
        };
      
        if (socket.currentRoom && roomUsers[socket.currentRoom] && Object.keys(roomUsers[socket.currentRoom]).length===0){
            //For memory management clearing everything
            delete roomMessages[socket.currentRoom]
            delete roomUsers[socket.currentRoom]
        }
        
    })
  
})


server.listen(3000)