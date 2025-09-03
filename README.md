# ChatRoomIO

This is a real-time chat application built with Node.js, Express, and Socket.IO. The application allows multiple users to join rooms, send messages, and see online users. 

## Live Demo

[ChatRoomIO on Render](https://chatroomio-yyz2.onrender.com/)

## GitHub Repository

[https://github.com/ambushneupane/ChatRoomIO](https://github.com/ambushneupane/ChatRoomIO)

## Features

* User registration and login
* Real-time messaging using Socket.IO
* Multiple chat rooms (`general`, `sports`, `tech`)
* Typing indicator
* Tracks users across multiple tabs using `userId`
* Chat history per room
* Online users list per room
* Logout functionality

## Project Structure

```
app.js                # Entry point
controller/           # Request controllers
database/             # Database connection and initialization
middleware/           # Express middlewares (auth, error handling, etc.)
models/               # Mongoose models (User, etc.)
public/               # Frontend static files (HTML, CSS, JS)
routes/               # API routes
socket/               # Socket.IO event handlers
utils/                # Helper utilities (e.g., AppError)
package.json          # Project metadata and dependencies
package-lock.json     # Locked dependency versions
node_modules/         # Installed packages
```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/ambushneupane/ChatRoomIO.git
cd ChatRoomIO
```

2. Install dependencies:

```bash
npm install
```

3. Set environment variables (create `.env` file):

```
PORT=3000
MONGO_URI=<your_mongodb_uri>
JWT_SECRET=<your_jwt_secret>
```

4. Run the application:

```bash
npm start
```

5. Open the browser and navigate to `http://localhost:3000`

## Usage

* Register a new user or login with an existing account.
* Select a room from the dropdown and join.
* Start chatting in real-time.
* Open multiple tabs to see how the same `userId` is tracked.
* Use the typing indicator and logout functionality.

