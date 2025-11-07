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

    // Al saber quien es el usuario conectado por los datos recibidos de la tarjeta ahora se simulará la entrada / salida de la torre, para ello:
    //    - 
    //    -
    manageTowerOpenDoorCommandForPlayer(msg, client, servo, io);
}

/**
 * Gives the correct format to cardId value deleting unnecesary blank spaces. For example: from  " 32 9B B4 02 " to "329BB402" 
 * @param msg Unformatted message 
 * @returns Formatted message
 */
function getCardIdFormat( message: Buffer<ArrayBufferLike>): string {

  let msg = message.toString();
  console.log(message.toJSON().data);
  // TODO: hacerlo con replaceAll(" ", "") muchísimo más simple.

  let formattedMessage = "";
  // Search something like: "id": "  ab c d e f 123  "
  // El patrón tiene solo un grupo de caputa (lo que hay dentro de los () en el patrón, es decir:   [^"]+   ) 
  // (_, hex) => hex.replace(/\s+/g, '') --> el primer argumento, _, es el match completo, tolo lo que coincidió con laexplresión regular, es decir "id": " a b cd e f " , pero como no se usa lo ponemos con _ en vez de llamarlo con un numbre al argumento. 
  formattedMessage = msg.replace(/"id":\s*"\s*([^"]+)\s*"/, (_, hex) => hex.replace(/\s+/g, ''));

  // Quita los especios en blanco tanto del principio como del final del string (" hola " => "hola")
  formattedMessage = formattedMessage.replace(/[{}]/g, '').trim();

  return formattedMessage;
}

const manageTowerOpenDoorCommandForPlayer = async (msg: string ,client: mqtt.MqttClient, servo: string, io: Server) => {
  const player = await playerService.getByCardId(msg);
  if (player) {
    if (player.inTower) {
      sendOpenDoorCommand(player, client, servo, io);
    } else {
      console.log(`${player.name} is NOT in Tower screen, access denied`);
    }

  }
}

function sendOpenDoorCommand(player: any, client: mqtt.MqttClient, servo: string, io: Server) {
  console.log(`${player.name} is in Tower screen, access granted`);
  let openDoor = '180';
  client.publish(servo, openDoor);

  updateInsideTowerFromPlayer(io, player);
}

async function updateInsideTowerFromPlayer(io: Server, player: any) {
  const insideTowerUpdatedPlayer = await playerService.updateInsideTower(player.email!);
  io.to(insideTowerUpdatedPlayer?.socketId!).emit(SocketEvents.UPDATE_USER_IN_CLIENT, insideTowerUpdatedPlayer);
}

