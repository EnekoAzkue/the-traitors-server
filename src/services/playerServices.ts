import { InferRawDocType } from "mongoose";
import Player from "../database/playerDatabase";
import { PLAYER_ROLES, EMAIL, DISEASES } from "../helpers/constants/constants";
import playerModel, { playerSchema } from "../models/playerModel";
import KaotikaUser from "../interfaces/playerModelInterfaces";

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

const getKaotikaPlayer = async (playerEmail: string) => {
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

const getMortimerUser = async () => {
  try {
    const mortimer = await Player.getMortimerUser();
    return mortimer;
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

const rest = async (playerEmail: string): Promise<KaotikaUser | null> => {
  try {
    const player = await getPlayer(playerEmail)

    if(!player) return null

    if(player?.resistance < 30) {
      console.log("The acolyte cannot rest due to low resistance")
      return null;
    }

    const changes = {
      resistance: 100
    }

    return await updatePlayer(playerEmail, changes)
  } catch (error) {
    throw error
  }
}

const heal = async (playerEmail: string, cure: string): Promise<KaotikaUser | null> => {
  let changes = {}

  console.log('healing ', playerEmail)
  try {
    
    if(cure === 'illness') {
      changes = {disease: []}
    } else if(cure === 'curse') {
      changes = {isCursed: false}
    } else if(cure === 'resistance') {
      changes = {resistance: 100}
    } else {
      console.log(`"${cure}" does not asociate with any option(illness, curse, resistance)`)
      return null
    }

    return await updatePlayer(playerEmail, changes)
  } catch (error) {
    throw error
  }
}

const curse = async (playerEmail: string): Promise<KaotikaUser | null> => {
    console.log('cursing ', playerEmail)

  try {
    const player = await getPlayer(playerEmail)

    if(player?.isCursed) {
      console.log('Player already cursed')
      return null
    }

    const changes = {
      isCursed: true
    }

    return await updatePlayer(playerEmail, changes)
  } catch (error) {
    throw error
  }
}

const infect = async (playerEmail: string, illness: string): Promise<KaotikaUser | null> => {
  console.log('infecting ', playerEmail)


  try {
    const player = await getPlayer(playerEmail)
    if(!player) return null

    let changes= {}

    if(illness === DISEASES.PUTRID_PLAGUE.name) {
      const alreadyIll = player.disease.some(illness => illness === DISEASES.PUTRID_PLAGUE.name)

      if(alreadyIll) {
        console.log('The acolyte already has this illness')
        return null
      }

      changes = {disease: [DISEASES.PUTRID_PLAGUE.name, ...player.disease]}
    } else if(illness === DISEASES.EPIC_WEAKNESS.name) {
      const alreadyIll = player.disease.some(illness => illness === DISEASES.EPIC_WEAKNESS.name)

      if(alreadyIll) {
        console.log('The acolyte already has this illness')
        return null
      }

      changes = {disease: [DISEASES.EPIC_WEAKNESS.name, ...player.disease]}
    } else if(illness === DISEASES.MEDULAR_APOCALYPSE.name) {
      const alreadyIll = player.disease.some(illness => illness === DISEASES.MEDULAR_APOCALYPSE.name)

      if(alreadyIll) {
        console.log('The acolyte already has this illness')
        return null
      }

      changes = {disease: [DISEASES.MEDULAR_APOCALYPSE.name, ...player.disease]}
    } else {
      console.log(`${illness} does not asociate with any option(Putrid Plague, Epic Weakness, Medular Apocalypse)`)
      return null
    }

    return await updatePlayer(playerEmail, changes)
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
};

export default playerService;