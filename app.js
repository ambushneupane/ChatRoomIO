require('dotenv').config()
const port=process.env.PORT|| 3000;
const express= require('express');
const http= require('http');
const {Server}=require('socket.io');
const connectDB=require('./database/connect');
const userRoutes=require('./routes/routes.js');
const errorHandler = require('./utils/errorHandler');
const app= express()
const server= http.createServer(app);

const io= new Server(server);

app.use(express.static(__dirname+'/public'))

const socketModule=require('./socket')(io)
app.use(express.json());
//User Route
app.use('/api/users',userRoutes);


app.use(errorHandler);
const start= async()=>{
    try{
        await connectDB(process.env.MONGO_URI);
        server.listen(port,()=>console.log(`Server is listening on port: ${port}`))
    }
    catch(err){
        console.error(err);
    }
}
start()

