import Artifact from '../database/artifactDatabase';
import ArtifactInterface from '../interfaces/artifactModelInterfaces';

  const getArtifacts = async (): Promise<ArtifactInterface[]> => {
    try {
        const artifacts = await Artifact.getArtifacts();
        return artifacts;
      } catch (error: any) {
        throw error
      }
  }

export default {
    getArtifacts,
}