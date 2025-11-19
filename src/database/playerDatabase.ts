import { Document, InferRawDocType, Query } from "mongoose";
import playerModel, { playerSchema } from "../models/playerModel";
import KaotikaUser from "../interfaces/playerModelInterfaces";
import { EMAIL } from "../helpers/constants/constants";


// --- GET PLAYER/S--- // 
const getPlayer = async (playerEmail: string) : Promise<KaotikaUser | null> => {
  try {
    const player = await playerModel.findOne({ email: playerEmail });
    return player;
  } catch (error) {
    throw error;
  }
};

/**
 * Finds the acolyte by cardId
 * @param cardId 
 * @returns The JSON of the acolyte with cardId value or null if not found
 */
const getByCardId = async (cardId: string): Promise<KaotikaUser | null> => {
  try {
    const acolyte = await playerModel.findOne({ cardId: cardId });
    return acolyte;
  } catch (error: any) {
    throw error;
  }
}

const getBySocketId = async (socketId: string): Promise<KaotikaUser | null> => {
  try {
    const acolyte = await playerModel.findOne({ socketId: socketId });
    return acolyte;
  } catch (error: any) {
    throw error;
  }
}

const getMortimerUser = async () => {
  try {
    const mortimer = await playerModel.findOne({ email: EMAIL.MORTIMER  });
    return mortimer;
  } catch (error: any) {
    throw error;
  }
}


const createPlayer = async (newPlayer: any) : Promise<KaotikaUser> => {
  try {
    const playerToInsert = new playerModel(newPlayer);
    const createdPlayer = await playerToInsert.save();
    return createdPlayer;
  } catch (error) {
    throw error;
  }
};

const updatePlayer = async (playerEmail: string, changes: any) : Promise<KaotikaUser> => {
  try {
    const updatedPlayer = await playerModel.findOneAndUpdate(
      { email: playerEmail }, { $set: changes }, { new: true, upsert: true }
    );
    return updatedPlayer;
  } catch (error) {
    throw error;
  }
};

const getAcolytes = async (): Promise<KaotikaUser[]> => {
  try {
    const acolytes = playerModel.find({ "rol": "acolyte" });
    return acolytes
  } catch (error: any) {
    throw error;
  }
}

const updateInsideTower = async (playerEmail: string, changes: any) : Promise<KaotikaUser> => {
  try {
    const updatedPlayer = await playerModel.findOneAndUpdate(
      { email: playerEmail }, { $set: changes }, { new: true }
    );

    if(!updatedPlayer){
      throw new Error(`Not found player with email: ${playerEmail}`);
    }
    
    return updatedPlayer;
  } catch (error) {
    throw error
  }
}

const playerDatabase = {
  getPlayer,
  getByCardId,
  getBySocketId,
  getMortimerUser,
  createPlayer,
  updatePlayer,
  getAcolytes,
  updateInsideTower,
};

export default playerDatabase;