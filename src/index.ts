import express from "express";
import bodyParser from "body-parser";
import playerRouter from "./routes/playerRoutes";
import mongoose from "mongoose";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import 'dotenv/config';
import { createServer } from "http";
import { DefaultEventsMap, Server, Socket } from "socket.io";
import manageSocketConnections from "./helpers/utilities/socket/socketUtilities";
import { manageBrokerConnection } from "./helpers/utilities/mqtt/mqttUtilities";



initializeApp({
  credential: applicationDefault(),
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use("/player", playerRouter);

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_ROUTE!); // ! es para indicar que no está vacio el valor (ts)

    httpServer.listen(PORT, () => {
      console.log(`API is listening on port ${PORT}.`);
    });

    console.log("You are now connected to Mongo.");

    // --- SOCKET CONNECTION MANAGEMENT --- //
    manageSocketConnections(io);

    // --- BROKER CONNECTION VIA MQTT MANAGEMENT --- //
    manageBrokerConnection(io);

  } catch (error: any) {
    console.log(`Error to connect to the database: ${error.message}`);
  }
}

start();

