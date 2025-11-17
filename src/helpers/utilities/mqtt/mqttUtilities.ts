import mqtt from "mqtt";
import { MqttEvents, MqttTopics, SocketEvents } from "../../constants/constants";
import playerService from "../../../services/playerServices";
import { Server } from "socket.io";


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
function manageMqttMessageEvent(code: string, message: Buffer<ArrayBufferLike>, client: mqtt.MqttClient, servo: string, io: Server){
    console.log("Detected MQTT mesage"); 

    let msg = getCardIdFormat(message);

    console.log(`MQTT Recieved topic: ${code}, message: ${msg}`);

    manageTowerOpenDoorCommandForPlayer(msg, client, servo, io);
}

/**
 * Gives the correct format to cardId value deleting unnecesary blank spaces. For example: from  " 32 9B B4 02 " to "329BB402" 
 * @param msg Unformatted message 
 * @returns Formatted message
 */
function getCardIdFormat( message: Buffer<ArrayBufferLike>): string {

  let msg = message.toString();
  console.log(`The cardID raw value is: ${msg}`);
  return JSON.parse(msg)?.id.replaceAll(" ", "");
}

const manageTowerOpenDoorCommandForPlayer = async (cardId: string ,client: mqtt.MqttClient, servo: string, io: Server) => {
    let towerAction = -1;
  const player = await playerService.getByCardId(cardId);
  if (player) {
    (player.inTower) ? (towerAction = 0) : (towerAction = 1);


  }else{
    towerAction = 1; 
    console.log(`Not found user with cardID: ${cardId}`);
  }

  sendDoorCommand(player, client, servo, io, towerAction);

}

function sendDoorCommand(player: any, client: mqtt.MqttClient, servo: string, io: Server, towerAction: number ) {

  let doorMessage = '';
  switch (towerAction) {
    case (0) : 
      // Player is in Tower Screen, ESP32 must:
      // -  Open Door --> Girar Servo a 180 durante 5 segunos y volver a 0º 
      // - Green LED
      // - Buzzer sound 
      doorMessage = 'Open';
      console.log(`${player.name} is in Tower screen, access granted`);
      updateInsideTowerFromPlayer(io, player);

    break;
    case (1) : 
      // Player not in Tower Screen, ESP32 must turn on RED LED
      doorMessage = 'Deny'
      console.log(`${player?.name} is NOT in Tower screen, access denied`);
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

