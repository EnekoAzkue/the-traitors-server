import mqtt from "mqtt";
import { MqttEvents, MqttTopics, SocketEvents } from "../../constants/constants";
import playerService from "../../../services/playerServices";
import { Server } from "socket.io";
import KaotikaUser from "../../../interfaces/playerModelInterfaces";
import admin from "firebase-admin";
import { sendNotification } from "../firebaseCloudMessaging/firebaseCloudMessaging";


export const manageBrokerConnection = (io: Server) => {
  const client = mqtt.connect('mqtt://broker.hivemq.com');
  const servo = MqttTopics.SERVO;
  const code = MqttTopics.CODE;

  client.on(MqttEvents.CONNECT, async () => {
    console.log('MQTT connected');
    client.subscribe(code);
  })

  client.on(MqttEvents.MESSAGE, async (code, message) => {
    manageMqttMessageEvent(code, message, client, servo, io);
  });

};


// --- MqttEvents.MESSAGE utils --- // 
function manageMqttMessageEvent(code: string, message: Buffer<ArrayBufferLike>, client: mqtt.MqttClient, servo: string, io: Server) {

  let msg = getCardIdFormat(message);

  manageTowerOpenDoorCommandForPlayer(msg, client, servo, io);
}

/**
 * Gives the correct format to cardId value deleting unnecesary blank spaces. For example: from  " 32 9B B4 02 " to "329BB402" 
 * @param msg Unformatted message 
 * @returns Formatted message
 */
function getCardIdFormat(message: Buffer<ArrayBufferLike>): string {

  let msg = message.toString();
  return JSON.parse(msg)?.id.replaceAll(" ", "");
}

const manageTowerOpenDoorCommandForPlayer = async (cardId: string, client: mqtt.MqttClient, servo: string, io: Server) => {
  let towerAction = -1;
  const player = await playerService.getByCardId(cardId);
  if (player) {
    (player.inTower) ? (towerAction = 0) : (towerAction = 1);


  } else {
    towerAction = 1;
    console.log(`Not found user with cardID: ${cardId}`);
  }

  sendDoorCommand(player, client, servo, io, towerAction);

}

async function sendDoorCommand(player: KaotikaUser | null, client: mqtt.MqttClient, servo: string, io: Server, towerAction: number) {

  let doorMessage = '';

  const mortimerUser = await playerService.getMortimerUser();

  switch (towerAction) {
    case (0):

      doorMessage = 'Open';
      console.log(`${player?.name} is in Tower screen, access granted`);
      updateInsideTowerFromPlayer(io, player);

      if(mortimerUser?.pushToken){
        sendNotification(mortimerUser?.pushToken, "An acolyte got inside tower!", `The acolyte ${player?.nickname} has entered the tower.`);
      }
      if(mortimerUser?.socketId) {
        console.log('updated inside tower for player to', player?.insideTower);

        console.log('sending updated player to mortimer')
        console.log(`socket id: ${mortimerUser?.socketId}`)
        io.to(mortimerUser.socketId).emit(SocketEvents.SEND_UPDATED_PLAYER_TO_MORTIMER, player)
      }
    break;
    case (1) : 
      // Player not in Tower Screen, ESP32 must turn on RED LED
      doorMessage = 'Deny'
      console.log(`${player?.name} is NOT in Tower screen, access denied`);
      if (mortimerUser?.pushToken) {
        sendNotification(mortimerUser?.pushToken, "An acolyte tried to access the tower!", `It was an attempt to open the towers door!`);
      }

      break;

    default:
      console.log(`ERROR! Action cannot be done for Action ID: ${towerAction}`);
  }
  client.publish(servo, doorMessage);
}

async function updateInsideTowerFromPlayer(io: Server, player: any) {
  const insideTowerUpdatedPlayer = await playerService.updateInsideTower(player.email!);
  io.to(insideTowerUpdatedPlayer?.socketId!).emit(SocketEvents.UPDATE_USER_IN_CLIENT, insideTowerUpdatedPlayer);
}

