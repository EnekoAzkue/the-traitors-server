import angeloServices from "../services/angeloServices";


const getAngelo = async (req: any, res: any) => {
  try {
    const angelo = await angeloServices.getAngelo();
    if (angelo === null) {
      return res.status(404).send({ message: "Angelo not found in DB" });
    }
    res.send(angelo)

  } catch (error: any) {
    res.status(500).send({
      status: "FAILED",
      message: "Error fetching angelo",
      data: { error: error?.message || error }
    });
  }
}



export default {
  getAngelo,

}