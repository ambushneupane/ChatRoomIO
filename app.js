const express= require('express');
const app=express();

const http= require('http');
const server= http.createServer(app);

const {Server}=require('socket.io');
const io= new Server(server);

app.use(express.static(__dirname + '/public'))

let onlineUsers={}

io.on('connection',(socket)=>{
    
    socket.on('nickname',(nickname)=>{
        onlineUsers[socket.id]=nickname||'Guest';
        io.emit('onlineUsers',Object.values(onlineUsers))
    })  

    socket.on('joinRoom',(roomName)=>{
        if (socket.currentRoom){
            socket.leave(socket.currentRoom);
        }        
        socket.join(roomName);
        socket.currentRoom=roomName;
    
    })

    socket.on('chatMessage',(msg)=>{
        console.log(socket.currentRoom)
        if (!socket.currentRoom) return;
        const payload={
            user:onlineUsers[socket.id] ||'Guest',
            text: msg.text
        };
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
        delete onlineUsers[socket.id];
        io.emit('onlineUsers',Object.values(onlineUsers))
    })
    // console.log("At last:",socket.currentRoom)

})


server.listen(3000)