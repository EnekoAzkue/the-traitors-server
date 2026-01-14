
import Disease from "../database/diseaseDatabase";
import DiseaseInterface from "../interfaces/diseaseModelInterfaces";

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

export default {
  getDiseases,
  getDiseaseByName,
};