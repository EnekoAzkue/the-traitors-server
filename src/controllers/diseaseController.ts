
import diseaseService from "../services/diseaseService";

const getDiseases = async (req: any, res: any) => {
  try {
    const diseases = await diseaseService.getDiseases();
    res.send(diseases);
  } catch (error: any) {
    res.status(500).send({
      status: "FAILED",
      message: "Error fetching artifacts",
      data: { error: error?.message || error },
    });
  }
}

const getDiseaseByName = async (req: any, res: any) => {
  const diseaseName = res.locals.diseaseName;

  if (!diseaseName) {
    return res.status(400).send({
      status: "FAILED",
      data: { error: "diseaseName not available" },
    });
  }

  try {
    const disease = await diseaseService.getDiseaseByName(diseaseName)
    if (!disease) {
      res.status(404).send({
        status: "FAILED",
        data: { error: `Can't find disease with name: ${diseaseName}` },
      });
    }
    res.send(disease);
  } catch (error: any) {
    res.status(500).send({
      status: "FAILED",
      message: "Error fetching disease",
      data: { error: error?.message || error },
    });
  }
}

export default {
  getDiseases,
  getDiseaseByName,
};