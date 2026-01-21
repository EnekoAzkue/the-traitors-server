import { KaotikaCharacters } from "../helpers/constants/constants";
import NpcInterface from "../interfaces/npcModelInterfaces";
import npcModel from "../models/npcModel";

// Si se crea un nuevo npc, tendrá otro servicio.

const getAngelo = async (): Promise<NpcInterface | null> => {
  try {
    const angelo = await npcModel.findOne({ name: KaotikaCharacters.ANGELO });
    return angelo;
  } catch (error) {
    throw error;
  }
};



export default {
  getAngelo,
};