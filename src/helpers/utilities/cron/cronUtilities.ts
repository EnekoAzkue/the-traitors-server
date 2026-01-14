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

async function getRandomDisease(){

}

async function modifyPlayerAttributes (loyalAcolyte: KaotikaUser) {
  if (loyalAcolyte.resistance > 0) {
    const loyalWithLessResistance = await reducePlayerResistance(loyalAcolyte, DARK_HEARTBEAT.MODIFICATION_VALUE);
    await increaseInsanityBasedOnResistance(loyalWithLessResistance, DARK_HEARTBEAT.MODIFICATION_VALUE);
  }
}

async function executeDarkHeartbeat(){
  const loyalAcolytes = await playerService.getLoyalAcolytes();
  loyalAcolytes.map(async (loyalAcolyte) => {
    await modifyPlayerAttributes(loyalAcolyte);
    
    console.log(`Player: ${loyalAcolyte.name}, Resistance: ${loyalAcolyte.resistance}, Insanity: ${loyalAcolyte.attributes.insanity}`);
  });
};

// --- CRON MANAGEMENT --- //

export default function manageCronTasks(io: Server){
  cron.schedule(CRON_SCHEDULES.TESTING, () => {
    executeDarkHeartbeat();
  });
}