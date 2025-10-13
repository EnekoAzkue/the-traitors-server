import express from "express";
import bodyParser from "body-parser";
import playerRouter from "./routes/playerRoutes";
import mongoose from "mongoose";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import 'dotenv/config';
import { createServer } from "http";
import { Server } from "socket.io";
import { SocketEvents } from "./constants/constants";




initializeApp({
  credential: applicationDefault(),
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use("/user", playerRouter);

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_ROUTE!);

    httpServer.listen(PORT, () => {
      console.log(`API is listening on port ${PORT}.`);
    });

    console.log("You are now connected to Mongo.");
    
    io.on(SocketEvents.CONNECT, (socket) => {
      socket.on(SocketEvents.CONNECTION_OPEN, (email: string) => {
        console.log(`User with email ${email} opened connection (socketId: ${socket.id})`);
      });
    });
  } catch (error: any) {
    console.log(`Error to connect to the database: ${error.message}`);
  }
}

start();

