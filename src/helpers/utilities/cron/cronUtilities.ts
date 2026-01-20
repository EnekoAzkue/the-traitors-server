import cron from "node-cron";
import { Server } from "socket.io";
import { CRON_SCHEDULES, DARK_HEARTBEAT, diseaseIndex, diseases, DiseasesNames, SocketEvents } from "../../constants/constants";
import KaotikaUser, { Attributes } from "../../../interfaces/playerModelInterfaces";
import playerService from "../../../services/playerServices";
import { getRandomNumber } from "../utilities";
import diseaseService from "../../../services/diseaseService";
import Disease from "../../../interfaces/diseaseModelInterfaces";
import { Interface } from "readline";
import { KeyObject } from "crypto";

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
  console.log("Disease index is", diseaseNameIndex);
  // console.log("Disease length is", diseases.length);
  if (diseaseNameIndex < diseases.length) { 
    
    const diseaseObtained = await diseaseService.getDiseaseByName(diseases[diseaseNameIndex]!);
    return diseaseObtained;
  }else{
    return null;
  }
}  

async function addDiseaseToUserOrNotAndExecute (loyalAcolyte: KaotikaUser) : Promise<KaotikaUser> {
  // Una vez elegido si se aplica una enfermedad dependiendo de cual sea aplicarle el estado y enviar al cliente 
  const randomDisease = await getRandomDiseaseOrNot();
  if (randomDisease != null && !loyalAcolyte.disease.includes(randomDisease.name) ){ 
    // Actualizar user trás ver si no tenía anteriormente esa enfermedad.

    console.log(`GOT RANDOM DISEASE FOR ${loyalAcolyte.nickname}: ${randomDisease.name}`);
    let updatedLoyalAcolyte = await playerService.updatePlayer(loyalAcolyte.email, { disease : [...loyalAcolyte.disease, randomDisease.name] });

    // Ejecutar la nueva enfermedad.
    updatedLoyalAcolyte = await diseaseService.executeDiseaseDebuffsOnPlayer(updatedLoyalAcolyte, randomDisease.name);

    return updatedLoyalAcolyte;
  }
  return loyalAcolyte;

}

// TODO: Move to player service file
async function reduceStrIntAndDexBasedOnCurrentResistance (user: KaotikaUser) {
  // Poner el valor actual que debería tener.
  const updatedPlayer = await playerService.updatePlayer(user.email, {
    'attributes.strength': (user.originalAtributes.strength * (user.resistance / 100)),
    'attributes.intelligence': (user.originalAtributes.intelligence * (user.resistance / 100)),
    'attributes.dexterity': (user.originalAtributes.dexterity * (user.resistance / 100)),
  });

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

async function modifyPlayerAttributesInEachCron(acolyte: KaotikaUser, isCursed: boolean = true, hasAnyIllness: boolean = true, hasFatigue: boolean = true) : Promise<KaotikaUser> {
  // 1º Reestablecer los valores originales tanto para los atributos, pero no la resistencia
  restoreOriginalAttributeValues(acolyte);
  // 2º Recorremos los atriburtos y si está maldito los vamos modificando:
  if(isCursed) acolyte = applyCurse(acolyte);
  // 3º Recorremos el array de enfermedades y si las que estén enlistadas aplicarle al acolitos sus efectos
  // if (hasAnyIllness) acolyte = await applyDiseases(acolyte);
  // 4º Aplicamos la reducción por cansancio
  // if(hasFatigue) acolyte = applyChronicFatigue(acolyte);
  return acolyte;
}

function restoreOriginalAttributeValues(acolyte: KaotikaUser){
  //
  Object.keys(acolyte.attributes).map((attributeName) => {
    const attrKey = attributeName as keyof Attributes;
    acolyte.attributes[attrKey] = acolyte.originalAtributes[attrKey];
  });
}

function applyCurse(acolyte: KaotikaUser) : KaotikaUser{
  if(acolyte.isCursed){
    // Al estar maldito, reducir todos los atriburtos del usuario un 40%
    const cursedReductionByPercents = generateCurseAttributesPercentages(acolyte);
    reduceKaotikaUserAttributesByPercents(acolyte, cursedReductionByPercents);
  } 
  return acolyte;
}

function reduceKaotikaUserAttributesByPercents (kaotikaUser: KaotikaUser, attributesPercents: Attributes) {

  // https://www.geeksforgeeks.org/typescript/how-to-iterate-over-object-properties-in-typescript/
  Object.entries(kaotikaUser.attributes).map((entry) => { // entry = [key, value][]
    // Se debe declarar una nueva variable como un string que pueda tener como valor obligatoriamente uno de los nombres de las keys de la interfaz attributes y no solamente kaotikaUser.attributes[key] por lo estricto que hemos 
    // configurado el archivo tsconfig.json ya que hemos puesto la propiedad noUncheckedIndexedAccess a true lo que hace que typescript lo entienda como valor undefined 
    //
    // as es un type assetion --> sirve para asertar un nuevo tipo de valor que puede tener la varaible/constante que hemos creado previamente, ojo no se usa para
    // sobreescribir el tipo de la propia variable/constante, sino para en tiempo de compilación cambiarle el tipo y que, por ejemplo, una nueva variable/constante lleve 
    // ese tipo declarado, pero es en una nueva variable/constante. 
    // 
    // Para especificar a TS que la clave de esta propiedad es correcta, se le especifica con keyof, entre otras opciones.
    // keyof sirve para declarar que la variable o constante que estoy especificando sea un string que tenga como valor el nombre de alguna de las claves del objeto que  
    // sigue a keyof, en el enlace sobre keyof se ve claramente.

    // https://dev.to/diwakarkashyap/as-in-typescript-as-keyword-in-typescript-31k7
    // https://www.typescriptlang.org/docs/handbook/2/keyof-types.html
    const key = entry[0] as keyof Attributes;
    const value = entry[1];
    kaotikaUser.attributes[key] = value * (1 - attributesPercents[key]); // 0.4X = (1.0X - 0.6X) 
  });
}

function generateCurseAttributesPercentages (acolyte: KaotikaUser) : Attributes{
  //TODO: https://sqlpey.com/javascript/top-2-ways-to-extract-keys-from-a-typescript-interface-as-an-array-of-strings/ --> Así no necesito pasar al acolito como parametro.

  let auxAttributesForCurse = {};
  
  Object.keys(acolyte.attributes).forEach((currentKey) => {
    let newAttribute = { [currentKey] : 0.4};
    auxAttributesForCurse = {...auxAttributesForCurse, ...newAttribute};
  });

  let curseAttributesReduction : Attributes = auxAttributesForCurse as Attributes; 
  return curseAttributesReduction;
}


async function applyDiseases (acolyte: KaotikaUser) : Promise<KaotikaUser> {
  acolyte.disease.forEach(async (diseaseName) => {
    const disease = await diseaseService.getDiseaseByName(diseaseName);
    if (disease) applyDisease(acolyte, disease);
  });
  return acolyte;
}

function applyDisease (acolyte: KaotikaUser, disease: Disease) {
  reduceKaotikaUserAttributesByPercents(acolyte, disease.attributeDebuffsByPercent);
}

function applyChronicFatigue (acolyte: KaotikaUser) : KaotikaUser{
  
  // 1º Reducir 10 unidades el valor de resistencia en caso de que no sea ya el valor 0
  if (acolyte.resistance > 0) acolyte.resistance -= 10;

  // 2º 
  
  // Aplicar insanity cuando la resistencia del acolito sea menor a 50
  if (acolyte.resistance < 50) acolyte.attributes.insanity += (50 - acolyte.resistance);
  return acolyte;
}

// async function executeDarkHeartbeat(io: Server){
  //   const loyalAcolytes = await playerService.getLoyalAcolytes();

  //   await Promise.all(
    //     loyalAcolytes.map(async (loyalAcolyte) => {
      //       // Modify players attributes in aech cron job tick
      //       let updatedLoyal = await modifyPlayerAttributes(loyalAcolyte);
      
      //       // Pick random disease (or not, if already has it or no disease has been selected) and execute 
//       updatedLoyal = await addDiseaseToUserOrNotAndExecute(updatedLoyal);

//       // Finally send via Socket.Io to this loyal acolyte, Mortimer, Istvan and Villain client roles the update values of acolyte
//       io.to(updatedLoyal.socketId).emit(SocketEvents.UPDATE_USER_IN_CLIENT, updatedLoyal);
//       const mortimer = await playerService.getMortimerUser();
//       if(mortimer) io.to(mortimer?.socketId).emit(SocketEvents.UPDATE_LOYALS);

//       const istvan = await playerService.getIstvanUser();
//       if (istvan) io.to(istvan.socketId).emit(SocketEvents.UPDATE_LOYALS);

//       const villain = await playerService.getVillainUser();
//       if (villain) io.to(villain.socketId).emit(SocketEvents.UPDATE_LOYALS);
//     })
//   );
// };

// TODO: Move to socketUtilities file
function sendToInterestedUsersUpdatedAcolyte (io: Server, acolyte: KaotikaUser) {
  // io.to(acolyte.socketId).emit();
}

async function executeDarkHeartbeat(io: Server){
  const loyalAcolytes = await playerService.getLoyalAcolytes();

  await Promise.all(
    loyalAcolytes.map(async (loyalAcolyte) => {
      loyalAcolyte = await updateLoyalWithCronTask(loyalAcolyte);
    })
  );
};

async function updateLoyalWithCronTask ( acolyte: KaotikaUser ): Promise<KaotikaUser> {
  let updatedLoyal = acolyte;

  // Pick random disease (or not, if already has it or no disease has been selected) and execute 
  updatedLoyal = await addDiseaseToUserOrNotAndExecute(updatedLoyal);
  
  // Modify players attributes in aech cron job tick
  updatedLoyal = await modifyPlayerAttributesInEachCron(acolyte);

  return updatedLoyal;

}

// --- CRON MANAGEMENT --- //

export default function manageCronTasks(io: Server){
  cron.schedule(CRON_SCHEDULES.TESTING_SLOW, () => {
    executeDarkHeartbeat(io);
  });
}