import cron from "node-cron";
import { Server } from "socket.io";
import { CRON_SCHEDULES, DARK_HEARTBEAT, diseaseIndex, diseases, DiseasesNames } from "../../constants/constants";
import KaotikaUser from "../../../interfaces/playerModelInterfaces";
import playerService from "../../../services/playerServices";
import { getRandomNumber } from "../utilities";
import diseaseService from "../../../services/diseaseService";
import Disease from "../../../interfaces/diseaseModelInterfaces";

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

async function getRandomDiseaseOrNot(): Promise<Disease | null> {
  // Elegir una enfermedad o ninguna (3 enfermedades o ninguna --> 4 posibilidades)
  let diseaseNameIndex = getRandomNumber(0, diseases.length); // 0-3 --> [0-2] --> all diseases diseases until now , [3] --> dont pick disease
  if (diseaseNameIndex < diseases.length) return await diseaseService.getDiseaseByName(diseases[diseaseNameIndex]!);
  return null;
}  

async function addDiseaseToUserOrNotAndExecute (loyalAcolyte: KaotikaUser) : Promise<KaotikaUser> {
  // Una vez elegido si se aplica una enfermedad dependiendo de cual sea aplicarle el estado y enviar al cliente 
  const randomDisease = await getRandomDiseaseOrNot();
  if (randomDisease != null && !loyalAcolyte.disease.includes(randomDisease.name) ){ 
    // Actualizar user trás ver si no tenía anteriormente esa enfermedad.
    let updatedLoyalAcolyte = await playerService.updatePlayer(loyalAcolyte.email, { disease : randomDisease.name });

    // Ejecutar la nueva enfermedad.
    updatedLoyalAcolyte = await diseaseService.executeDiseaseDebuffsOnPlayer(updatedLoyalAcolyte, randomDisease.name);

    return updatedLoyalAcolyte;
  }
  return loyalAcolyte;

}

// TODO: Move to player service file
async function reduceStrIntAndDexBasedOnCurrentResistance (user: KaotikaUser) {
  // TODO: Optimizar changes usando Object.keys
  console.log(user.name)
  console.log(user.originalAtributes)
  const changes = {
    'attributes.strength': (user.originalAtributes.strength * (user.resistance / 100)),
    'attributes.intelligence': (user.originalAtributes.intelligence * (user.resistance / 100)),
    'attributes.dexterity': (user.originalAtributes.dexterity * (user.resistance / 100)),
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

// TODO: Move to socketUtilities file
function sendToInterestedUsersUpdatedAcolyte (io: Server, acolyte: KaotikaUser) {
  // io.to(acolyte.socketId).emit();
}

async function executeDarkHeartbeat(io: Server){
  const loyalAcolytes = await playerService.getLoyalAcolytes();

  await Promise.all(
    loyalAcolytes.map(async (loyalAcolyte) => {
      // Modify players attributes in aech cron job tick
      let updatedLoyal = await modifyPlayerAttributes(loyalAcolyte);
    
      // Pick random disease (or not, if already has it or no disease has been selected) and execute 
      updatedLoyal = await addDiseaseToUserOrNotAndExecute(updatedLoyal);

      // Finally send via Socket.Io to this loyal acolyte, Mortimer, Istvan and Villain client roles the update values of acolyte
      // io.to(lo)
    })
  );
};

// --- CRON MANAGEMENT --- //

export default function manageCronTasks(io: Server){
  cron.schedule(CRON_SCHEDULES.TESTING_FAST, () => {
    executeDarkHeartbeat(io);
  });
}