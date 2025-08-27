
const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const onlineUsersList = document.getElementById('online-users');
const roomSelect= document.getElementById('roomSelect')
const nickname=prompt('Enter Your Name') || 'GUEST';
const joinRoomBtn = document.getElementById('joinRoomBtn');
const typingIndicator= document.getElementById('typingIndicator');
const errorBox= document.getElementById('errorBox')

socket.emit('nickname',nickname)

let currentRoom="general"

socket.emit('joinRoom',currentRoom)


function appendMessage({user,text,time,isSystem=false}){
const li= document.createElement('li');
const localTime= new Date(time|| Date.now()).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})
if(isSystem){
  li.textContent=`${localTime} ${text}`;
  li.style.fontStyle='italic';
  li.style.color='grey';
  li.style.margin = '0.25rem 0';
}else{
  const displayName= (user===nickname)? "You": user;
  li.textContent= `${localTime} ${displayName}: ${text}`
};
messages.appendChild(li)
messages.scrollTop = messages.scrollHeight
}



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
  },3000)
})

socket.on('errorMsg',(msg)=>{
  errorBox.textContent=msg;

  setTimeout(()=>{
    errorBox.textContent=''
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
socket.on('joinRoomMsg',(msg)=>{
 appendMessage({text:msg===nickname?"You have joined the chat":`${msg} has joined the chat`,isSystem:true})
})

socket.on('chatMessage',(msg)=>{
    appendMessage(msg)

})

socket.on('chatHistory',(chats)=>{
  chats.forEach(chat=>appendMessage(chat))
})

socket.on('typing',(user)=>{
  typingIndicator.textContent=`${user} is typing` 
})

socket.on('stopTyping',()=>{
  typingIndicator.textContent=''
})


