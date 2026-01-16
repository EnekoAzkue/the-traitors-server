import diseaseModel from "../models/diseaseModel";
import DiseaseInterface from "../interfaces/diseaseModelInterfaces";

const getDiseases = async (): Promise<DiseaseInterface[]> => {
  try {
    console.log("Getting all diseases...");
    const diseases = await diseaseModel.find();
    return diseases;
  } catch (error: any) {
    throw error;
  }
};

const getDiseaseByName = async (diseaseName: string): Promise<DiseaseInterface | null> => {
  try {
    const disease = await diseaseModel.findOne({name: diseaseName});
    return disease;
  }catch( error: any) {
    throw error;
  }
}

export default {
  getDiseases,
  getDiseaseByName,
};