import Angelo from "./../database/angeloDatabase";
import NpcInterface from "../interfaces/npcModelInterfaces";

const getAngelo = async () : Promise<NpcInterface | null> => {
  try{
    const angelo : (NpcInterface | null) = await Angelo.getAngelo();
    if (angelo === null) {throw new Error("Angelo is not in DB.");}
    return angelo;
  }catch(error: any){
    console.error(`ERROR in AngeloService: ${error}`);
    return null;
  }
};

const updateAngelo = async (changes: any) => {
  try {
    const updatedAngelo = Angelo.updateAngelo(changes)
    return updatedAngelo;
  } catch (error) {
    throw error;
  }
};

export default {
  getAngelo,
  updateAngelo,
}