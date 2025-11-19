import { InferRawDocType } from "mongoose";
import Player from "../database/playerDatabase";
import { PLAYER_ROLES, EMAIL } from "../helpers/constants/constants";
import { playerSchema } from "../models/playerModel";
import KaotikaUser from "../interfaces/playerModelInterfaces";




// --- GET --- // 
const getPlayer = async (playerEmail: string): Promise<KaotikaUser | null> => {
  try {
    console.log("Fetching player from MongoDB...")
    const player = await Player.getPlayer(playerEmail);
    console.log(`Player is: ${player?.name} is player inside tower ${player?.insideTower}?`);
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
    console.log('Error detected while trying to get kaotika player...')
    console.log(error);
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


const getByCardId = async (cardId: string): Promise<KaotikaUser | null> => {
  try {
    const acolyte = await Player.getByCardId(cardId);
    return acolyte;
  } catch (error: any) {
    throw error
  }
}


const getBySocketId = async (socketId: string): Promise<KaotikaUser | null> => {
  try{
    const acolyte = await Player.getBySocketId(socketId);
    return acolyte;
  }catch(error: any){
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

    if (!(changes?.socketId === '')) {
      console.log("Updating player...")
    }
    const updatedPlayer = await Player.updatePlayer(playerEmail, changes);
    return updatedPlayer;
  } catch (error) {
    throw error;
  }
};

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
        ...kaotikaPlayer,
      };

      if (newPlayer.email.includes(EMAIL.ACOLYTE)) {
        newPlayer.rol = PLAYER_ROLES.ACOLYTE;
      } else if (newPlayer.email === EMAIL.ISTVAN) {
        newPlayer.rol = PLAYER_ROLES.ISTVAN;
      } else if (newPlayer.email === EMAIL.MORTIMER) {
        newPlayer.rol = PLAYER_ROLES.MORTIMER;
      } else if (newPlayer.email === EMAIL.VILLAIN) {
        newPlayer.rol = PLAYER_ROLES.VILLAIN;
      }

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
  console.log("SENDING REQUEST TO KAOTIKA API TO GET KAOTIKA USER...");
  const kaotikaPlayer = await getKaotikaPlayer(playerEmail);

  if (!kaotikaPlayer) {
    throw new Error(`Player not found in Kaotika with email: ${playerEmail}`);
  }

  try {

    const updatedPlayer = await updatePlayer(playerEmail, {
      active: true,
      ...kaotikaPlayer,
    });

    return updatedPlayer;

  } catch (error) {

    console.log("FALLÓ");
  }
};

const updateInsideTower = async (playerEmail: string): Promise<KaotikaUser> => {
  try {

    const player = await getPlayer(playerEmail);
    console.log(`Updating insideTower from ${playerEmail}... value: ${player?.insideTower})`);

    const changes = {
      insideTower: !player?.insideTower,
    }

    console.log(`Changes in inside tower are:`);
    console.log(changes);

    const updatedPlayer = await Player.updateInsideTower(playerEmail, changes);
    return updatedPlayer;

  } catch (error) {
    throw error;
  }
}

const playerService = {
  createPlayer,
  getPlayer,
  getAcolytes,
  getByCardId,
  getBySocketId,
  getKaotikaPlayer,
  getMortimerUser,
  loginPlayer,
  logedPlayer,
  updatePlayer,
  updateInsideTower,
};

export default playerService;