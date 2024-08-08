//entry point to the server

const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const http = require("http");
const cors = require("cors"); //to handle the cors issue
const { Server } = require("socket.io"); //  server is an class which exists inside the socket.io
   
// Middleware to parse incoming request bodies as JSON
app.use(bodyParser.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
let roomUsers = {}; // Object to store users in each room
let room;

//Actual socket.io works(it works based on events(emit,connection,listen))
io.on("connection", (socket) => { 
  // console.log(socket.id); //whenever someone opens the website and connected we will get their id
  socket.on("private message", (data) => {    
    io.to(data.chat_id).emit("private_message", data);
  });


  socket.on('joinroom', ({ room, userCode }) => {
    if (!roomUsers[room]) {
      roomUsers[room] = [];
    }
    roomUsers[room].push(userCode);    
    socket.join(room);
    
    console.log(roomUsers);
    console.log("roomUserss");
    io.to(room).emit('room_users', roomUsers);
  });

  socket.on('leave_room', ({ room, userCode }) => {
    console.log(roomUsers);
    console.log("leave room");
    if (roomUsers[room]) {
      roomUsers[room] = roomUsers[room].filter((user) => user !== userCode);
      io.to(room).emit('room_users', roomUsers[room]);
    }
  });

  socket.on('update_messages', ({ room, messages }) => {
    io.to(room).emit('update_messages', { room, messages });
  });

  socket.on('update_users', (data) => {
    io.emit('update_users', data);
  });
  
  socket.on("disconnect", () => {
    roomUsers = {}
    console.log(roomUsers);
    console.log("User Disconnected ", socket.id);
  });
});


app.post('api/query', (req, res) => {
    try {
      const requestData = req.body.data; // Assuming 'data' is the key used in the request
  
      console.log('Received data:', requestData);
  
      // Add your logic to process the received data
  
      res.status(200).json({ message: 'Data received successfully' });
    } catch (error) {
      console.error('Error processing POST request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

server.listen(7000, () => {
  console.log("Server Running....");
});

// whenever the npm start it should start nodemon also so we mentioned "Start" in package.json
