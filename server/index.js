const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const app = express();
const socket = require("socket.io");
const connectDB = require("./db");
const path = require("path");
require("dotenv").config();

app.use(cors());
app.use(express.json());

connectDB();
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

//--------------------Deployment----------------------------

app.use(express.static(path.join(__dirname, "./public/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/build/index.html"));
});

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);
const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});
