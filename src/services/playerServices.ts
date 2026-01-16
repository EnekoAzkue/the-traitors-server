import { InferRawDocType } from "mongoose";
import Player from "../database/playerDatabase";
import { PLAYER_ROLES, EMAIL, DiseasesNames } from "../helpers/constants/constants";
import playerModel, { playerSchema } from "../models/playerModel";
import KaotikaUser from "../interfaces/playerModelInterfaces";
import BasicKaotikaUser from "../interfaces/basicPlayerModelInterfaces";

// --- GET --- // 
const getPlayer = async (playerEmail: string): Promise<KaotikaUser | null> => {
  try {
    console.log("Fetching player from MongoDB...")
    const player = await Player.getPlayer(playerEmail);
    return player;
  } catch (error) {
    throw error;
  }
};

const getKaotikaPlayer = async (playerEmail: string): Promise<BasicKaotikaUser> => {
  console.log(`Fetching player from Kaotika for player: [${playerEmail}]`);
  const FETCH_ROUTE_KAOTIKA_API = `https://kaotika-server.fly.dev/players/email/${playerEmail}`;

  try {
    const response = await fetch(FETCH_ROUTE_KAOTIKA_API);

    if (!response.ok) {
      throw new Error(`Kaotika API error: ${response.status}`);
    }
    const kaotikaPlayer: any = await response.json();
    const playerData = kaotikaPlayer.data;
    return playerData || null;

  } catch (error) {
    throw error;
  }
};

const getAcolytes = async (): Promise<KaotikaUser[]> => {
  try {
    const acolytes = await Player.getAcolytes();
    return acolytes;
  } catch (error: any) {
    throw error
  }
}

const getLoyalAcolytes = async (): Promise<KaotikaUser[]> => {
  try {
    const acolytes = await Player.getLoyalAcolytes();
    return acolytes;
  } catch (error: any) {
    throw error
  }
}

const getBetrayerAcolytes = async (): Promise<KaotikaUser[]> => {
  try {
    const acolytes = await Player.getBetrayerAcolytes();
    return acolytes;
  } catch (error: any) {
    throw error
  }
}

const getAllAcolytesPushTokens = async (): Promise<(string | undefined)[]> => {
  const allAcolytes = await playerService.getAcolytes();

  let tokensOfAcolytesAbleToReceiveNotifications = [];

  tokensOfAcolytesAbleToReceiveNotifications = allAcolytes.map((acolyte) => {
    if (acolyte.pushToken) return acolyte.pushToken;
  });

  return tokensOfAcolytesAbleToReceiveNotifications;

}


const getByCardId = async (cardId: string): Promise<KaotikaUser | null> => {
  try {
    const acolyte = await Player.getByCardId(cardId);
    return acolyte;
  } catch (error: any) {
    throw error
  }
}


const getBySocketId = async (socketId: string): Promise<KaotikaUser | null> => {
  try {
    const acolyte = await Player.getBySocketId(socketId);
    return acolyte;
  } catch (error: any) {
    throw error;
  }
}

const getMortimerUser = async (): Promise<KaotikaUser | null> => {
  try {
    const mortimer = await Player.getMortimerUser();
    return mortimer;
  } catch (error: any) {
    throw error;
  }
}

const getIstvanUser = async () => {
  try {
    const istvan = await Player.getIstvanUser();
    return istvan;
  } catch (error: any) {
    throw error;
  }
}

const getVillainUser = async () => {
  try {
    const villain = await Player.getVillainUser();
    return villain;
  } catch (error: any) {
    throw error;
  }
}

const getAllAcolytesInSwamp = async (): Promise<KaotikaUser[]> => {
  try {
    const swampAcolytes = await Player.getAllAcolytesInSwamp();
    return swampAcolytes;
  } catch (error) {
    throw error;
  }
}

const createPlayer = async (newPlayer: any) => {
  try {
    console.log(`Player not found in MondoDB.`)
    console.log("Creating player...")
    const createdPlayer = await Player.createPlayer(newPlayer);
    return createdPlayer;
  } catch (error) {
    throw error;
  }
};

const updatePlayer = async (playerEmail: string, changes: any) => {
  try {
    const updatedPlayer = await Player.updatePlayer(playerEmail, changes);
    return updatedPlayer;
  } catch (error) {
    throw error;
  }
};


export const getUsersRol = (email: string) => {

  let newPlayersRol = undefined;

  if (email.includes(EMAIL.ACOLYTE)) {
    newPlayersRol = PLAYER_ROLES.ACOLYTE;
  } else if (email === EMAIL.ISTVAN) {
    newPlayersRol = PLAYER_ROLES.ISTVAN;
  } else if (email === EMAIL.MORTIMER) {
      newPlayersRol = PLAYER_ROLES.MORTIMER;
  } else if (email === EMAIL.VILLAIN) {
    newPlayersRol = PLAYER_ROLES.VILLAIN;
  }

  if(!newPlayersRol) throw new Error(`Error! This email is not from Kaotika!`);

  return newPlayersRol;  

}

const loginPlayer = async (playerEmail: string): Promise<any> => {
  try {
    const kaotikaPlayer = await getKaotikaPlayer(playerEmail);
    if (!kaotikaPlayer) {
      throw new Error(`Player not found in Kaotika with email: ${playerEmail}`);
    }
    const mongoPlayer = await getPlayer(playerEmail);

    let putOrPost = [];

    if (!mongoPlayer) {
      const newPlayer = {
        active: false,
        rol: "",
        socketId: "",
        pushToken: "",
        cardId: "",
        isInside: false,
        inTower: false,
        insideTower: false,
        inSwamp: false,
        inHall: false,
        homeLocation: (kaotikaPlayer.isBetrayer ? "Hollow" : null),
        resistance: 100,
        disease: [],
        isCursed: false,
        originalAtributes: kaotikaPlayer.attributes,
        ...kaotikaPlayer,
      };
      const playersRol = getUsersRol(newPlayer.email);
      newPlayer.rol = playersRol;

      const createdPlayer = await createPlayer(newPlayer)

      putOrPost.push(0);
      putOrPost.push(createdPlayer);

      return putOrPost;
    }

    const updatedPlayer = await updatePlayer(playerEmail, {
      active: true,
      ...kaotikaPlayer,
    });

    putOrPost.push(1);
    putOrPost.push(updatedPlayer);

    return putOrPost;

  } catch (error) {
    throw error;
  }
};

const logedPlayer = async (playerEmail: string): Promise<any> => {
  const kaotikaPlayer = await getKaotikaPlayer(playerEmail);

  if (!kaotikaPlayer) {
    throw new Error(`Player not found in Kaotika with email: ${playerEmail}`);
  }

  try {

    const updatedPlayer = await updatePlayer(playerEmail, {
      active: true,
      inSwamp: false,
      inTower: false,
      inHall: false,
      homeLocation: (kaotikaPlayer.isBetrayer ? "Hollow" : null),
      resistance: 100,
      disease: [],
      isCursed: false,
      ...kaotikaPlayer,
    });

    return updatedPlayer;

  } catch (error) {

    throw error;
  }
};

const updateInsideTower = async (playerEmail: string): Promise<KaotikaUser> => {
  try {

    const player = await getPlayer(playerEmail);

    const changes = {
      insideTower: !player?.insideTower,
    }

    const updatedPlayer = await Player.updateInsideTower(playerEmail, changes);
    return updatedPlayer;

  } catch (error) {
    throw error;
  }
}

const rest = async (player: KaotikaUser): Promise<KaotikaUser | null> => {
  try {

    if(player?.resistance < 30) {
      console.log("The acolyte cannot rest due to low resistance")
      return null;
    }

    const changes = {
      resistance: 100, 
      "attributes.intelligence": (100 * player.attributes.intelligence) / player.resistance,
      "attributes.dexterity": (100 * player.attributes.dexterity) / player.resistance,
      "attributes.strength": (100 * player.attributes.strength) / player.resistance,
      "attributes.insanity": player.originalAtributes.insanity,
    }

    return await updatePlayer(player.email, changes)
  } catch (error) {
    throw error
  }
}

const heal = async (player: KaotikaUser, cure: string): Promise<KaotikaUser | null> => {
  let healedPlayer;

  try {
    
    if(cure === 'illness') {
      healedPlayer = await removeAllDiseases(player)
    } else if(cure === 'curse') {
      healedPlayer = await removeCurse(player)
    } else if (cure === 'resistance') {
      healedPlayer =  await restAcolyte(player)


    } else {
      console.log(`"${cure}" does not asociate with any option(illness, curse, resistance)`)
      return null
    }

    return healedPlayer
  } catch (error) {
    throw error
  }
}


const curse = async (player: KaotikaUser): Promise<KaotikaUser | null> => {
    console.log('cursing ', player.email);

  try {

    if(player.isCursed) {
      console.log('Player already cursed');
      return null;
    }

    // El 100%-40% = 60%  
    const changes = {
      isCursed: true,
      "attributes.intelligence" : player.attributes.intelligence  * 0.6,
      "attributes.dexterity"    : player.attributes.dexterity     * 0.6,
      "attributes.charisma"     : player.attributes.charisma      * 0.6,
      "attributes.constitution" : player.attributes.constitution  * 0.6,
      "attributes.strength"     : player.attributes.strength      * 0.6,
      "attributes.insanity"     : player.attributes.insanity      * 0.6,
    }

    return await updatePlayer(player.email, changes);
  } catch (error) {
    throw error;
  }
}

const infect = async (player: KaotikaUser, illness: DiseasesNames): Promise<KaotikaUser | null> => {
  try {
    // Hay que verificar que el player no tenga ya la enfermedad
    if (!player.disease.includes(illness)){
      player.disease.push(illness);
      const diseasedPlayer = await updatePlayer(player.email, {disease: [illness, ...player.disease]});
      return diseasedPlayer;
    }
    return null;
  } catch (error) {
    throw error;
  }
}

async function removeAllDiseases(player: KaotikaUser): Promise<KaotikaUser>{
  try{
    return await updatePlayer(player.email, { "disease" :  [] });
  }catch(error: any){
    throw error;
  }
};

async function removeDisease(player: KaotikaUser, newDisease: string): Promise<KaotikaUser>{
  try{
    // Hay que verificar que el player tenga ya la enfermedad
    if (player.disease.includes(newDisease)){
      player.disease.splice(player.disease.indexOf(newDisease));
      const healedPlayer = await updatePlayer(player.email, { "disease" :  player.disease });
      return healedPlayer;
    }
    return player;
    
  }catch(error: any){
    throw error;
  }
};

async function removeCurse(player: KaotikaUser): Promise<KaotikaUser>{
  try {
    return await playerService.updatePlayer(player.email, { "isCursed" : false})
  } catch (error) {
    throw error
  }
}

async function restAcolyte(player: KaotikaUser): Promise<KaotikaUser>{
  const changes = {
    "attributes.insanity": player.originalAtributes.insanity,
    "attributes.intelligence": (100 * player.attributes.intelligence) / player.resistance,
    "attributes.dexterity": (100 * player.attributes.dexterity) / player.resistance,
    "attributes.strength": (100 * player.attributes.strength) / player.resistance,
    resistance: 100
  }

  try {
    return await playerService.updatePlayer(player.email, changes)
  } catch (error) {
    throw error
  }




}

const playerService = {
  createPlayer,
  getPlayer,
  getAcolytes,
  getAllAcolytesPushTokens,
  getByCardId,
  getBySocketId,
  getKaotikaPlayer,
  getMortimerUser,
  getIstvanUser,
  getVillainUser,
  getAllAcolytesInSwamp,
  getLoyalAcolytes,
  getBetrayerAcolytes,
  loginPlayer,
  logedPlayer,
  updatePlayer,
  updateInsideTower,
  rest,
  heal,
  curse,
  infect,
  removeAllDiseases,
  removeDisease,

};

export default playerService;