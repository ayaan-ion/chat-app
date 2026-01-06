import express from 'express';
import "dotenv/config";
import cors from 'cors';
import http from 'http';
import { connect } from 'http2';
import { connectdb } from './lib/mongodb.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import {Server} from 'socket.io';
//create express  app and http server
const app = express();
const server = http.createServer(app);
//create socket io server
export const io=new Server(server,{
    cors:{origin:"*"}
});
//store online users
export const usersocektMap={};
//socket io connection handler
io.on("connection",(socket)=>{
    const userId=socket.handshake.query.userId;
    console.log("user connected with id:",userId);
    if(userId){
        usersocektMap[userId]=socket.id;
    }

    

    // ===== WEBRTC SIGNALING =====

socket.on("webrtc-offer", ({ to, offer }) => {
  const targetSocketId = usersocektMap[to];
  if (targetSocketId) {
    io.to(targetSocketId).emit("webrtc-offer", {
      offer,
      from: userId   // ✅ ADD THIS
    });
  }
});


socket.on("webrtc-answer", ({ to, answer }) => {
  const targetSocketId = usersocektMap[to];
  if (targetSocketId) {
    io.to(targetSocketId).emit("webrtc-answer", { answer });
  }
});

socket.on("webrtc-ice", ({ to, candidate }) => {
  const targetSocketId = usersocektMap[to];
  if (targetSocketId) {
    io.to(targetSocketId).emit("webrtc-ice", { candidate });
  }
});

    //emit online users  to all connected users
    io.emit("getonlineusers",Object.keys(usersocektMap));
    // ================= CALL EVENTS =================

// when caller initiates a call
socket.on("call-user", ({ to, from, callType }) => {
    const targetSocketId = usersocektMap[to];
    if (targetSocketId) {
        io.to(targetSocketId).emit("incoming-call", {
            from,
            callType
        });
    }
});


// when receiver accepts the call
socket.on("accept-call", ({ to, answer }) => {
    const targetSocketId = usersocektMap[to];
    if (targetSocketId) {
        io.to(targetSocketId).emit("call-accepted", {
            answer
        });
    }
});

// when either user ends the call
socket.on("end-call", ({ to }) => {
    const targetSocketId = usersocektMap[to];

    // send to OTHER user
    if (targetSocketId) {
        io.to(targetSocketId).emit("call-ended");
    }

    // send to SELF also
    socket.emit("call-ended");
});


    socket.on("disconnect",()=>{
        console.log("user disconnected with id:",userId);
        delete usersocektMap[userId];
        io.emit("getonlineusers",Object.keys(usersocektMap));
    });
});
//middlewares
app.use(express.json({limit: '4mb'}));
app.use(cors());
//routes setup
app.use('/api/status', (req, res) => {
    res.send('Server is live');
});
app.use('/api/auth',userRouter);
app.use('/api/messages',messageRouter);

//connect to mongodb
await connectdb();
if(process.env.NODE_ENV!=="production"){

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
//export server for vercel
export default server;
