import cron from "node-cron";
import { Server } from "socket.io";
import { CRON_SCHEDULES, DARK_HEARTBEAT, diseaseIndex, diseases, DiseasesNames } from "../../constants/constants";
import KaotikaUser from "../../../interfaces/playerModelInterfaces";
import playerService from "../../../services/playerServices";
import { getRandomNumber } from "../utilities";
import diseaseService from "../../../services/diseaseService";

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

async function getRandomDiseaseForUser( user: KaotikaUser ){
  // Elegir una enfermedad o ninguna (3 enfermedades o ninguna --> 4 posibilidades)
  let choosenDiseaseIndex = getRandomNumber(0,3);
  
  
  // TODO: Una vez elegido si se aplica una enfermedad dependiendo de cual sea aplicarle el estado y enviar al cliente 
  if (choosenDiseaseIndex < 3){ // Si vale 3 entonces es que no se ha elegido una enfermedad
    // TODO: Actualizar user para ver si tiene enfermedad
    

    // Ejecutar 
    diseaseService.executeDiseaseDebuffsOnPlayer(user, diseases[choosenDiseaseIndex]!);
  }

}

// TODO: Move to player service file
async function reduceStrIntAndDexBasedOnCurrentResistance (user: KaotikaUser) {
  const changes = {
    'attributes.strength': (user.attributes.strength * (user.resistance / 100)),
    'attributes.intelligence': (user.attributes.intelligence * (user.resistance / 100)),
    'attributes.dexterity': (user.attributes.dexterity * (user.resistance / 100)),
  }; 
  
  const updatedPlayer = await playerService.updatePlayer(user.email, changes);
  return updatedPlayer;
}


async function modifyPlayerAttributes (loyalAcolyte: KaotikaUser) {
  if (loyalAcolyte.resistance > 0) {
    const loyalWithLessResistance = await reducePlayerResistance(loyalAcolyte, DARK_HEARTBEAT.MODIFICATION_VALUE);
    let updatedAcolyte = await reduceStrIntAndDexBasedOnCurrentResistance(loyalWithLessResistance);
    return await increaseInsanityBasedOnResistance(updatedAcolyte, DARK_HEARTBEAT.MODIFICATION_VALUE);
  }
  return loyalAcolyte;
}

async function executeDarkHeartbeat(){
  const loyalAcolytes = await playerService.getLoyalAcolytes();

  await Promise.all(
    loyalAcolytes.map(async (loyalAcolyte) => {
      const updatedLoyal = await modifyPlayerAttributes(loyalAcolyte);
      
      console.log(`Player: ${updatedLoyal.name}, Resistance: ${updatedLoyal.resistance}, Insanity: ${updatedLoyal.attributes.insanity}`);
    })
  );
};

// --- CRON MANAGEMENT --- //

export default function manageCronTasks(io: Server){
  cron.schedule(CRON_SCHEDULES.TESTING_SLOW, () => {
    executeDarkHeartbeat();
  });
}