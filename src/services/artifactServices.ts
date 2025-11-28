import Artifact from '../database/artifactDatabase';
import ArtifactInterface from '../interfaces/artifactModelInterfaces';

  const getArtifacts = async (): Promise<ArtifactInterface[]> => {
    try {
        const artifacts = await Artifact.getArtifacts();
        if(artifacts.length === 0) {
          throw new Error('There are no artifacts')
        }
        return artifacts;
      } catch (error: any) {
        throw error
      }
  }

  const getArtifactByName = async (artifactName: string): Promise<ArtifactInterface | null> => {
    try {
      const artifact = await Artifact.getArtifactByName(artifactName)
      return artifact
    } catch (error) {
      throw error
    }
  }

  const collectArtifact = async (artifactName: string): Promise <ArtifactInterface | null> => {
    try {
      const artifact = await getArtifactByName(artifactName)
      if(artifact?.state === 'collected') {
        throw new Error(`${artifactName} already collected`);
      }
      
      const changes = {
        state: 'collected'
      }

    const collectedArtifact = await Artifact.collectArtifact(artifactName, changes);
    return collectedArtifact;  
    } catch (error) {
      throw error
    }
  }

  const updateArtifact = async (artifactName: string, changes: any): Promise<ArtifactInterface | null> => {
    try {
      const updatedArtifact = await Artifact.updateArtifact(artifactName,changes)
      return updatedArtifact
    } catch (error) {
      throw error
    }
  }

  const endSearch = async () => {
    const artifacts = await getArtifacts()
    const changes = {
      state: 'inactive'
    }
    for(let i = 0; i < artifacts.length; i++) {
      let artifactName = artifacts[i]?.name
      if(artifactName) {
        await updateArtifact(artifactName, changes)
      }
    }
    try {
      
    } catch (error) {
      
    }
  }

const activateArtifacts = async () => {
  try {
    const artifacts = await getArtifacts();
    if (!artifacts || artifacts.length === 0) return;

    // .sort busca en el array si hay algun elemento que coincida con la busqueda, en este caso si el estado esta 'active'
    const anyActive = artifacts.some(a => a.state === "active");
    if (anyActive) {
      console.log("Some artifacts are already active. Skipping activation.");
      return;
    }

    // Mezclar y seleccionar 4 artefactos aleatorios
    const shuffled = [...artifacts].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 4);

    const changes = { state: "active" };
  // Promise.all: actualiza los 4 artefactos en paralelo para mayor rendimiento. Sino cada artefacto deberia tener un await
    await Promise.all(
      selected.map(a =>
        updateArtifact(a.name, changes)
      )
    );

    console.log("Artifacts activated:", selected.map(a => a.name));

  } catch (error) {
    console.error("Error activating artifacts:", error);
    throw error;
  }
};


export default {
    getArtifacts,
    getArtifactByName,
    collectArtifact,
    updateArtifact,
    activateArtifacts,
}