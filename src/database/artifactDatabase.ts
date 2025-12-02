import ArtifactInterface from "../interfaces/artifactModelInterfaces";
import artifactModel from "../models/artifactModel";

const getArtifacts = async (): Promise<ArtifactInterface[]> => {
  try {
    console.log("Fetching artifacts...");
    const artifacts = await artifactModel.find();
    return artifacts
  } catch (error: any) {
    throw error;
  }
};

const getArtifactByName = async (artifactName: string): Promise<ArtifactInterface | null> => {
  try {
    console.log(`Fetching aritfact(${artifactName})...`)
    const artifact = await artifactModel.findOne({ name: artifactName })
    return artifact
  } catch (error) {
    throw error
  }
}

const collectArtifact = async (artifactName: string, changes: any): Promise<ArtifactInterface | null> => {
  try {
    console.log(`Collecting artifact(${artifactName})...`)
    const collectedArtifact = await artifactModel.findOneAndUpdate(
      { name: artifactName }, { $set: changes }, { new: true }
    );
    return collectedArtifact
  } catch (error) {
    throw error
  }
}

const updateArtifact = async (artifactName: string, changes: any): Promise<ArtifactInterface | null> => {
  try {
    console.log(`Updating artifact(${artifactName})...`)
    const updatedArtifact = await artifactModel.findOneAndUpdate(
      { name: artifactName }, { $set: changes }, { new: true }
    );
    return updatedArtifact
  } catch (error) {
    throw error
  }
}

export default {
  getArtifacts,
  getArtifactByName,
  collectArtifact,
  updateArtifact,
}
