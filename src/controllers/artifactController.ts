import artifactService from "../services/artifactServices";

const getArtifacts = async (req: any, res: any) => {
  try {
    const artifacts = await artifactService.getArtifacts();
    res.send(artifacts);
  } catch (error: any) {
    res.status(500).send({
      status: "FAILED",
      message: "Error fetching artifacts",
      data: { error: error?.message || error },
    });
  }
}

const getArtifactByName = async (req: any, res: any) => {
  const artifactName = res.locals.artifactName;

  if (!artifactName) {
    return res.status(400).send({
      status: "FAILED",
      data: { error: "artifactName not available" },
    });
  }

  try {
    const artifact = await artifactService.getArtifactByName(artifactName)
    if (!artifact) {
      res.status(404).send({
        status: "FAILED",
        data: { error: `Can't find artifact with name: ${artifactName}` },
      });
    }
    res.send(artifact);
  } catch (error: any) {
    res.status(500).send({
      status: "FAILED",
      message: "Error fetching artifact",
      data: { error: error?.message || error },
    });
  }
}

const collectArtifact = async (req: any, res: any) => {

  const {
    params: { artifactName },
  } = req
  if (!artifactName) {
    return res.status(400).send({
      status: "FAILED",
      data: { error: "Parameter ':artifactName' can not be empty" },
    });
  }

  try {
    const collectedArtifact = await artifactService.collectArtifact(artifactName);

    if (!collectedArtifact) {
      return res.status(403).send({
        status: "FAILED",
        data: { error: `Can't find artifact with the name: ${artifactName}` }
      });
    }
    console.log("Artifact collected successfully.")
    res.send(collectArtifact)

  } catch (error: any) {
    res.status(500).send({
      status: "FAILED",
      message: "Error collecting artifact",
      data: { error: error?.message || error },
    });
  }
}

const updateArtifact = async (req: any, res: any) => {

  const {
    body,
    params: { artifactName },
  } = req

  if (!artifactName) {
    return res.status(400).send({
      status: "FAILED",
      data: { error: "Parameter ':artifactName' can not be empty" },
    });
  }
  try {
    const updatedArtifact = await artifactService.updateArtifact(artifactName, body);
    if (!updatedArtifact) {
      return res.status(404).send({
        status: "FAILED",
        data: { error: `Can't find artifact with the name: ${artifactName}` }
      });
    }
    console.log("Artifact updated successfully.")
    res.send(updatedArtifact)
  } catch (error: any) {
    res.status(500).send({
      status: "FAILED",
      message: "Error updating artifact",
      data: { error: error?.message || error },
    });
  }
}

export default {
  getArtifacts,
  getArtifactByName,
  collectArtifact,
  updateArtifact
};

