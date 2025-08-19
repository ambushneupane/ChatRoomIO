
const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const onlineUsersList = document.getElementById('online-users');
const roomSelect= document.getElementById('roomSelect')
const nickname=prompt('Enter Your Name') || 'GUEST';
const joinRoomBtn = document.getElementById('joinRoomBtn');
const typingIndicator= document.getElementById('typingIndicator');


socket.emit('nickname',nickname)

let currentRoom="SSRF"

socket.emit('joinRoom',currentRoom)

const joinRoom=(roomName)=>{
  if(currentRoom===roomName) return;
  currentRoom=roomName;
  socket.emit('joinRoom',roomName)
  messages.innerHTML='';
}

joinRoomBtn.onclick=()=>{
  const selectedRoom= roomSelect.value;
  joinRoom(selectedRoom);
}


form.addEventListener('submit',(e)=>{
    e.preventDefault();
    if(input.value){
        socket.emit('chatMessage',{user:nickname,text:input.value});
        input.value='';
        socket.emit('stopTyping');
    }
})

let timeout;
input.addEventListener('input',()=>{
  if(currentRoom) socket.emit('typing');
  clearTimeout(timeout)
  timeout=setTimeout(()=>{
    socket.emit('stopTyping');
  },5000)
})


socket.on('onlineUsers',(users)=>{
    onlineUsersList.innerHTML='';
    users.forEach(user => {
      const li= document.createElement('li');
      li.textContent=user;
      onlineUsersList.appendChild(li);
      
    });

  })

socket.on('chatMessage',(msg)=>{
    const li= document.createElement('li');
    li.textContent=`${msg.user}: ${msg.text}`
    messages.appendChild(li);

})

socket.on('typing',(user)=>{
  typingIndicator.textContent=`${user} is typing` 
})

socket.on('stopTyping',()=>{
  typingIndicator.textContent=''
})
