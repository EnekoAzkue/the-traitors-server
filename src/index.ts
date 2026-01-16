import express from "express";
import bodyParser from "body-parser";
import Router from "./routes/Routes";
import mongoose from "mongoose";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import 'dotenv/config';
import { createServer } from "http";
import { Server } from "socket.io";
import manageSocketConnections from "./helpers/utilities/socket/socketUtilities";
import { manageBrokerConnection } from "./helpers/utilities/mqtt/mqttUtilities";
import manageCronTasks from "./helpers/utilities/cron/cronUtilities";

initializeApp({
  credential: applicationDefault(),
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use("/", Router);

async function start() {
  try {

    const { MONGODB_URI_TEST, MONGODB_URI_PROD, NODE_ENV } = process.env

    const connectionString = NODE_ENV === 'test'
      ? MONGODB_URI_TEST
      : NODE_ENV === 'development'
        ? MONGODB_URI_TEST
        : MONGODB_URI_PROD

    await mongoose.connect(connectionString!); // ! es para indicar que no está vacio el valor (ts)

    httpServer.listen(PORT, () => {
      console.log(`API is listening on port ${PORT}.`);
    });

    console.log("You are now connected to Mongo.");

    // --- SOCKET CONNECTION MANAGEMENT --- //
    manageSocketConnections(io);

    // --- BROKER CONNECTION VIA MQTT MANAGEMENT --- //
    manageBrokerConnection(io);

    // --- CRON TASKS MANAGEMENT --- //
    // manageCronTasks(io);

  } catch (error: any) {
    console.log(`Error to connect to the database: ${error.message}`);
  }
}

start();

export default app;