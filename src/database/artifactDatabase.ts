import ArtifactInterface from "../interfaces/artifactModelInterfaces";
import artifactModel from "../models/artifactModel";

const getArtifacts = async (): Promise<ArtifactInterface[]> => {
    try {
      const artifacts = artifactModel.find();
      return artifacts
    } catch (error: any) {
      throw error;
    }
  }

export default {
    getArtifacts,
}
