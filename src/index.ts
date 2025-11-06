import express from "express";
import bodyParser from "body-parser";
import playerRouter from "./routes/playerRoutes";
import mongoose from "mongoose";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import 'dotenv/config';
import { createServer } from "http";
import { DefaultEventsMap, Server, Socket } from "socket.io";
import playerServices from "./services/playerServices";
import manageSocketConnections from "./helpers/utilities/socket/socketUtilities";
import mqtt from 'mqtt';
import { MqttEvents, MqttTopics, SocketEvents } from "./helpers/constants/constants";





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

    const client = mqtt.connect('mqtt://broker.hivemq.com');
    const servo = MqttTopics.SERVO;
    const code = MqttTopics.CODE;

    client.on(MqttEvents.CONNECT, async () => {
      console.log('MQTT connected');

      client.subscribe(code);
    })

    client.on(MqttEvents.MESSAGE, async (code, message) => {
      let msg = message.toString()
      msg = msg.replace(/"id":\s*"\s*([^"]+)\s*"/, (_, hex) => hex.replace(/\s+/g, ''));
      msg = msg.replace(/[{}]/g, '').trim();
      console.log(`MQTT Recieved topic: ${code}, message: ${msg}`)
      const player = await playerServices.getByCardId(msg);
      if (player) {
        console.log(player.inTower)
        if (!player.inTower) {
          console.log(`${player.name} is in Tower screen, access granted`)
          let openDoor = '180';
          client.publish(servo, openDoor)
          const insideTowerUpdatedPlayer = await playerServices.updateInsideTower(player.email!)
          console.log(insideTowerUpdatedPlayer?.insideTower)
          io.to(insideTowerUpdatedPlayer?.socketId!).emit(SocketEvents.UPDATE_USER_IN_CLIENT, insideTowerUpdatedPlayer);

        } else {
          console.log(`${player.name} is NOT in Tower screen, access denied`)
        }

      }
    })


  } catch (error: any) {
    console.log(`Error to connect to the database: ${error.message}`);
  }
}

start();

