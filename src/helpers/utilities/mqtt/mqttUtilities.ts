import mqtt from "mqtt";
import { MqttEvents, MqttTopics, SocketEvents } from "../../constants/constants";
import playerService from "../../../services/playerServices";
import { Server } from "socket.io";
import KaotikaUser from "../../../interfaces/playerModelInterfaces";
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
export function getCardIdFormat(message: Buffer<ArrayBufferLike>): string {
  try{
    let msg = message.toString();
    console.log(`"${msg}"`);
    const res = JSON.parse(msg)?.id.replaceAll(" ", "");
    console.log(`"${res}"`)
    return res;
  }catch(error){
    throw error;
  }
}

const manageTowerOpenDoorCommandForPlayer = async (cardId: string, client: mqtt.MqttClient, servo: string, io: Server) => {
  let towerAction = -1;
  const player = await playerService.getByCardId(cardId);
  if (player) {
    (player.inTower) ? (towerAction = 0) : (towerAction = 1);
  } else {
    towerAction = 1;
  }

  sendDoorCommand(player, client, servo, io, towerAction);
}

export const getTheProperMortimerNotificationContent = (acolytesNickname: string, isAcolyteInsideTower: boolean): string[] => {
  let whereGoesAcolyte = "An acolyte goes outside tower!";
  let mortimerNotificationOfTowersDoor = `The acolyte ${acolytesNickname} has exit the tower.`;

  if (isAcolyteInsideTower) {
    whereGoesAcolyte = 'An acolyte goes inside tower!';
    mortimerNotificationOfTowersDoor = `The acolyte ${acolytesNickname} has entered the tower.`;
  }

  return [whereGoesAcolyte, mortimerNotificationOfTowersDoor];
}

async function sendDoorCommand(player: KaotikaUser | null, client: mqtt.MqttClient, servo: string, io: Server, towerAction: number) {

  let doorMessage = '';

  const mortimerUser = await playerService.getMortimerUser();

  switch (towerAction) {
    case (0):
      doorMessage = 'Open';
      const updatedplayer = await updateInsideTowerFromPlayer(io, player);

      if (mortimerUser && player) {
        const mortimerNotificationContent = getTheProperMortimerNotificationContent(player.nickname, updatedplayer.insideTower);
        sendNotification(mortimerUser.pushToken, mortimerNotificationContent[0], mortimerNotificationContent[1]);
      }

      if (mortimerUser?.socketId) {
        io.to(mortimerUser.socketId).emit(SocketEvents.SEND_UPDATED_PLAYER_TO_MORTIMER, updatedplayer);
      }
      break;
    case (1):
      doorMessage = 'Deny'
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
  const insideTowerUpdatedPlayer = await playerService.updateInsideTower(player?.email);
  io.to(insideTowerUpdatedPlayer?.socketId).emit(SocketEvents.UPDATE_USER_IN_CLIENT, insideTowerUpdatedPlayer);
  return insideTowerUpdatedPlayer;
}

