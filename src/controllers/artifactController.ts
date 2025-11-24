import artifactService from "../services/artifactServices";

const getArtifacts = async (req: any, res: any) => {
  try {
    console.log("Fetching artifacts...");
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

export default {
  getArtifacts,
};

