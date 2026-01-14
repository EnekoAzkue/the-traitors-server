import cron from "node-cron";
import { Server } from "socket.io";
import { CRON_SCHEDULES, DARK_HEARTBEAT } from "../../constants/constants";
import KaotikaUser from "../../../interfaces/playerModelInterfaces";
import playerService from "../../../services/playerServices";

// --- CRON TASKS --- //

async function reducePlayerResistance(player: KaotikaUser, resistanceValue: number){
  return await playerService.updatePlayer(player.email, { resistance: player.resistance - resistanceValue });
}

async function increaseInsanityBasedOnResistance(player: KaotikaUser, insanityValue: number){
  if( player.resistance < DARK_HEARTBEAT.RESISTANCE_VALUE_TO_START_INCREASING_INSANITY){
    const attributesWithMoreInsanity = player.attributes;
    attributesWithMoreInsanity.insanity += insanityValue; 
    return await playerService.updatePlayer(player.email, {attributes : attributesWithMoreInsanity});
  }
  return player;
}

function checkIfAcolyteIsTired(acolyte: KaotikaUser) {
  if (acolyte.resistance <= 30 && (acolyte.resistance + DARK_HEARTBEAT.MODIFICATION_VALUE) > 30) { // Si en la anterior ejecución del cron la resistencia era 30 y se reduce en este a 20 el acolito pasa a estar cansado. 
    // TODO: Mandar por socket el usuario a cliente para que le apareza el modal bloqueante TiredModal 

  }
}

async function getRandomDisease(){
  // TODO: Una vez elegido si se aplica una enfermedad dependiendo de cual sea aplicarle el estado y enviar al cliente 

}

async function modifyPlayerAttributes (loyalAcolyte: KaotikaUser) {
  if (loyalAcolyte.resistance > 0) {
    const loyalWithLessResistance = await reducePlayerResistance(loyalAcolyte, DARK_HEARTBEAT.MODIFICATION_VALUE);
    return await increaseInsanityBasedOnResistance(loyalWithLessResistance, DARK_HEARTBEAT.MODIFICATION_VALUE);
  }
  return loyalAcolyte;
}

async function executeDarkHeartbeat(){
  const loyalAcolytes = await playerService.getLoyalAcolytes();
  loyalAcolytes.map(async (loyalAcolyte) => {
    await modifyPlayerAttributes(loyalAcolyte);
    await checkIfAcolyteIsTired(loyalAcolyte);
    
    console.log(`Player: ${loyalAcolyte.name}, Resistance: ${loyalAcolyte.resistance}, Insanity: ${loyalAcolyte.attributes.insanity}`);
  });
};

// --- CRON MANAGEMENT --- //

export default function manageCronTasks(io: Server){
  cron.schedule(CRON_SCHEDULES.TESTING, () => {
    executeDarkHeartbeat();
  });
}