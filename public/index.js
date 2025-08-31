
const chatContainer = document.getElementById('chatContainer');
        
const token = localStorage.getItem('authToken');

    let nickname='GUEST';
    let currentRoom = "general";

    const socket = io({
        auth:{token}
    });
    const form = document.getElementById('form');
    const input = document.getElementById('input');
    const messages = document.getElementById('messages');
    const onlineUsersList = document.getElementById('online-users');
    const roomSelect = document.getElementById('roomSelect');
    const joinRoomBtn = document.getElementById('joinRoomBtn');
    const typingIndicator = document.getElementById('typingIndicator');
    const errorBox = document.getElementById('errorBox');
    const usersToggle = document.getElementById('usersToggle');
    const usersSection = document.getElementById('usersSection');
    const messagesSection = document.getElementById('messagesSection');
    const logoutBtn = document.getElementById('logoutBtn');
 
    let usersVisible = true;

if (!token) {
window.location.href = '/login.html';
}else{
fetch('/api/users/verify-token',{
    headers:{'Authorization':'Bearer '+ token}
})
.then(res=>{
    if(!res.ok) throw new Error('Invalid token')
    return res.json()


})
.then(data=>{
    chatContainer.style.display = 'block';
    nickname=data.user.username || 'GUEST'
    
    socket.emit('nickname', nickname);      
    socket.emit('joinRoom', currentRoom);
})
.catch(err=>{
    alert(err.message);
    localStorage.removeItem('authToken');
    window.location.href="/login.html";
})
}

    usersToggle.onclick = function() {
        usersVisible = !usersVisible;
        if (usersVisible) {
            usersSection.classList.remove('hidden');
            messagesSection.classList.remove('full-width');
            usersToggle.textContent = 'Users';
        } else {
            usersSection.classList.add('hidden');
            messagesSection.classList.add('full-width');
            usersToggle.textContent = ' Show Users';
        }
    };


   

    function appendMessage({user, text, time, isSystem = false}) {
        const li = document.createElement('li');
        const localTime = new Date(time || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
        
        if (isSystem) {
            li.textContent = localTime + ' ' + text;
            li.style.fontStyle = 'italic';
            li.style.color = 'grey';
            li.style.margin = '0.25rem 0';
        } else {
            const displayName = (user === nickname) ? "You" : user;
            li.textContent = localTime + ' ' + displayName + ': ' + text;
        }
        
        messages.appendChild(li);
        messages.scrollTop = messages.scrollHeight;
    }

    const joinRoom = function(roomName) {
      
        if (currentRoom === roomName) return;
        currentRoom = roomName;
        socket.emit('joinRoom', roomName);
        messages.innerHTML = '';
    };

    joinRoomBtn.onclick = function() {
     
        const selectedRoom = roomSelect.value.toLowerCase();
        joinRoom(selectedRoom);
    };

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (input.value) {
            socket.emit('chatMessage', {user: nickname, text: input.value});
            input.value = '';
            socket.emit('stopTyping');
        }
    });

    let timeout;
    input.addEventListener('input', function() {
        if (currentRoom) socket.emit('typing');
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            socket.emit('stopTyping');
        }, 3000);
    });

    socket.on('errorMsg', function(msg) {
        errorBox.textContent = msg;
        setTimeout(function() {
            errorBox.textContent = '';
        }, 5000);
    });

    socket.on('onlineUsers', function(users) {
        onlineUsersList.innerHTML = '';
        users.forEach(function(user) {
            const li = document.createElement('li');
            li.textContent = user;
            onlineUsersList.appendChild(li);
        });
    });

    

    socket.on('chatMessage', function(msg) {
        appendMessage(msg);
    });

    socket.on('chatHistory', function(chats) {
        chats.forEach(function(chat) {
            appendMessage(chat);
        });
    });

    socket.on('typing', function(user) {
        typingIndicator.textContent = user + ' is typing';
    });

    socket.on('stopTyping', function() {
        typingIndicator.textContent = '';
    });


    logoutBtn.onclick = function() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('authToken');
            window.location.href = 'login.html';
        }
    };