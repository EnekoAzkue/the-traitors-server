import { Document, InferRawDocType, Query } from "mongoose";
import playerModel, { playerSchema } from "../models/playerModel";

const getPlayer = async (playerEmail: string) => {
  try {
    const player = await playerModel.findOne({ email: playerEmail });
    return player;
  } catch (error) {
    throw error;
  }
};

const createPlayer = async (newPlayer: any) => {
  try {
    const playerToInsert = new playerModel(newPlayer);
    const createdPlayer = await playerToInsert.save();
    return createdPlayer;
  } catch (error) {
    throw error;
  }
};

const updatePlayer = async (playerEmail: string, changes: any) => {
  try {
    const updatedPlayer = await playerModel.findOneAndUpdate(
      { email: playerEmail }, { $set: changes }, { new: true, upsert: true }
    );
    return updatedPlayer;
  } catch (error) {
    throw error;
  }
};

const getAcolytes = async () => {
  try {
    const acolytes = playerModel.find({ "rol": "acolyte" });
    return acolytes
  } catch (error: any) {
    throw error;
  }
}



const getByCardId = async (cardId: string)  => {
  try {
    const acolyte = await playerModel.findOne({ cardId: cardId });
    return acolyte;
  } catch (error: any) {
    throw error;
  }
}

const updateInsideTower = async (playerEmail: string, changes: any) => {
  try {
    const updatedPlayer = await playerModel.findOneAndUpdate(
      { email: playerEmail }, { $set: changes }, { new: true }
    );
    return updatedPlayer
  } catch (error) {
    throw error
  }
}

const playerDatabase = {
  getPlayer,
  createPlayer,
  updatePlayer,
  getAcolytes,
  getByCardId,
  updateInsideTower,
};

export default playerDatabase;