import Player from "../database/playerDatabase";
import USER_ROLES from "../roles/roles";
import EMAIL from "../roles/emails";

const getPlayer = async (playerEmail: string) => {
  try {
    console.log("Fetching player from MongoDB...")
    const player = await Player.getPlayer(playerEmail);
    return player;
  } catch (error) {
    throw error;
  }
};

const getKaotikaPlayer = async (playerEmail: string) => {
  try {
        console.log("Fetching player from Kaotika...")
    const response = await fetch(`https://kaotika-server.fly.dev/players/email/${playerEmail}`);
    if (!response.ok) {
      throw new Error(`Kaotika API error: ${response.status}`);
    }
    const kaotikaPlayer: any = await response.json();
    const playerData = kaotikaPlayer.data
    return playerData || null;
  } catch (error) {
    throw error;
  }
};

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
    console.log("Updating player...")
    const updatedPlayer = await Player.updatePlayer(playerEmail, changes);
    return updatedPlayer;
  } catch (error) {
    throw error;
  }
};

const loginPlayer = async (playerEmail: string) => {
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
        isInside: false,
        ...kaotikaPlayer,   
      };

    if(newPlayer.email.includes(EMAIL.ACOLYTE)) {
      newPlayer.rol = USER_ROLES.ACOLYTE;
    } else if(newPlayer.email === EMAIL.ISTVAN) {
      newPlayer.rol = USER_ROLES.ISTVAN;
    } else if(newPlayer.email === EMAIL.MORTIMER) {
      newPlayer.rol = USER_ROLES.MORTIMER;
    } else if(newPlayer.email === EMAIL.VILLAIN) {
      newPlayer.rol = USER_ROLES.VILLAIN;
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

const logedPlayer = async (playerEmail: string) => {
  try {
    const kaotikaPlayer = await getKaotikaPlayer(playerEmail);
    if (!kaotikaPlayer) {
      throw new Error(`Player not found in Kaotika with email: ${playerEmail}`);
    }

    const updatedPlayer = await updatePlayer(playerEmail, {
      active: true,
      ...kaotikaPlayer,
    });

    return updatedPlayer;

  } catch (error) {
    throw error;
  }
};

const getAcolytes = async () => {
  try {
    const acolytes = Player.getAcolytes();
    return acolytes
  } catch(error: any) {
    throw error
  }
}

const playerService = {
  getPlayer,
  createPlayer,
  updatePlayer,
  getKaotikaPlayer,
  loginPlayer,
  logedPlayer,
  getAcolytes,
};

export default playerService;