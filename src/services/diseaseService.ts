
import Disease from "../database/diseaseDatabase";
import { DiseasesNames } from "../helpers/constants/constants";
import DiseaseInterface from "../interfaces/diseaseModelInterfaces";
import KaotikaUser from "../interfaces/playerModelInterfaces";
import playerService from "./playerServices";

const getDiseases = async (): Promise<DiseaseInterface[]> => {
  try {
    const diseases = await Disease.getDiseases();
    if (diseases.length === 0) {
      throw new Error('There are no diseases');
    }
    return diseases;
  } catch (error: any) {
    console.error(`ERROR DETECTED IN 'getDiseases()': \n${error}`);
    return [];
  }
}

const getDiseaseByName = async (diseaseName: string) => {
  try {
    const disease = await Disease.getDiseaseByName(diseaseName);
    return disease;
  }catch( error: any) {
    throw error;
  }
}

const executeDiseaseDebuffsOnPlayer = async (acolyte: KaotikaUser, diseaseName: DiseasesNames ) : Promise<KaotikaUser> => {
  try {
    const disease = await getDiseaseByName(diseaseName);
    let updatedUser = null;

    if(disease){
      // Es mejor usar "attributes.intelligence" : newVal que "attributes": { "intelligence": newValue} ya que así evito que si un dia se añada un nuevo atributo (por ejemplo MagicPoints), lo borre 
      updatedUser = playerService.updatePlayer(acolyte.email, { "attributes" : {
        "intelligence"    : acolyte.originalAtributes.intelligence - (acolyte.originalAtributes.intelligence * disease.attributeDebuffsByPercent.intelligence),
        "dexterity"       : acolyte.originalAtributes.dexterity - (acolyte.originalAtributes.dexterity * disease.attributeDebuffsByPercent.dexterity),
        "charisma"        : acolyte.originalAtributes.charisma - (acolyte.originalAtributes.charisma * disease.attributeDebuffsByPercent.charisma),
        "constitution"    : acolyte.originalAtributes.constitution - (acolyte.originalAtributes.constitution * disease.attributeDebuffsByPercent.constitution),
        "strength"        : acolyte.originalAtributes.strength - (acolyte.originalAtributes.strength * disease.attributeDebuffsByPercent.strength),
        "insanity"        : acolyte.originalAtributes.insanity - (acolyte.originalAtributes.insanity * disease.attributeDebuffsByPercent.insanity),
      }});
      return updatedUser;
    }else{
      throw new Error;
    }

  }catch(error: any){
    throw error;
  } 
}

export default {
  getDiseases,
  getDiseaseByName,
  executeDiseaseDebuffsOnPlayer,
};