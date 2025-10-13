import playerService from "../services/playerServices";

//TESTING
const getMongoPlayer = async (req: any, res: any) => {
  const playerEmail = res.locals.playerEmail;

  if (!playerEmail) {
    return res.status(400).send({
      status: "FAILED",
      data: { error: "playerEmail not available" },
    });
  }

  try {
    const player = await playerService.getPlayer(playerEmail);
    if (!player) {
      return res.status(403).send({
        status: "FAILED",
        data: { error: `Can't find player with the Email: ${playerEmail}` },
      });
    }
    res.send({ player });
  } catch (error: any) {
    res.status(500).send({
      status: "FAILED",
      message: "Error fetching player from Mongo",
      data: { error: error?.message || error },
    });
  }
};

//TESTING
const getKaotikaPlayer = async (req: any, res: any) => {
  const playerEmail = res.locals.playerEmail;

  if (!playerEmail) {
    return res.status(400).send({
      status: "FAILED",
      data: { error: "playerEmail not available" },
    });
  }

  try {
    const player = await playerService.getKaotikaPlayer(playerEmail);
    if (!player) {
      return res.status(403).send({
        status: "FAILED",
        data: { error: `Can't find player in Kaotika with the Email: ${playerEmail}` },
      });
    }
    res.send({ player });
  } catch (error: any) {
    res.status(500).send({
      status: "FAILED",
      message: "Error fetching player from Kaotika",
      data: { error: error?.message || error },
    });
  }
};

const loginPlayer = async (req: any, res: any) => {
  const playerEmail = res.locals.playerEmail;
  console.log(`Logging in with Email: ${playerEmail}.`)
  if (!playerEmail) {
    console.log(`Email not available: ${playerEmail}.`)
    return res.status(400).send({
      status: "FAILED",
      data: { error: "playerEmail not available" },
    });
  }

  try {
    const putOrPost = await playerService.loginPlayer(playerEmail);

    const player = putOrPost[1];

    if(putOrPost[0] === 0) {
      console.log("Player created successfully.\n")
      return res.status(201).send({
        status: "OK",
        message: "Player created successfully",
        player
      });
    } else {
      console.log("Player updated successfully.\n")
      return res.status(200).send({
        status: "OK",
        message: "Player updated successfully",
        player
      });
    }
    
  } catch (error) {
    console.log(`Player not found in Kaotika with Email: ${playerEmail}`)
    res.status(403).send({
      status: "FAILED",
      message: "Player not found on kaotika"
    });
  }
};

const loggedPlayer = async (req: any, res: any) => {
  const playerEmail = res.locals.playerEmail;
  console.log(`Player with email: ${playerEmail} already logged in.`)
  if (!playerEmail) {
    console.log(`Email not available: ${playerEmail}.`)
    return res.status(400).send({
      status: "FAILED",
      data: { error: "playerEmail not available" },
    });
  }

  try {
    const updatedPlayer = await playerService.logedPlayer(playerEmail);
    console.log("Player updated successfully.\n")
    return res.status(200).send({
      status: "OK",
      message: "Player updated successfully",
      player: updatedPlayer,
    });

  } catch (error) {
    return res.status(400).send({
      status: "FAILED",
      data: { error: "playerEmail not available" },
    });
  }
};

const getPlayer = async (req: any, res: any ) => {
  const {params: {playerEmail}} = req;

  try {
    const player = await playerService.getPlayer(playerEmail);
    if (!player) {
      return res.status(403).send({
        status: "FAILED",
        data: { error: `Can't find player with the Email: ${playerEmail}` },
      });
    }
    res.send({ player });
  } catch (error: any) {
    res.status(500).send({
      status: "FAILED",
      message: "Error fetching player from Mongo",
      data: { error: error?.message || error },
    });
  }
};

const updatePlayer = async (req: any, res: any) => {
  const {
    body,
    params: {playerEmail},
  } = req

  if(!playerEmail) {
    return res.status(400).send({
      status: "FAILED",
      data: { error: "Parameter ':playerEmail' can not be empty"},
    });
  }

  try {
    const updatedPlayer = await playerService.updatePlayer(playerEmail, body);

    if(!updatePlayer) {
      return res.status(403).send({
        status: "FAILED",
        data: { error: `Can't find player with the Email: ${playerEmail}`}
      });
    }
    console.log("Player updated successfully.")
    res.send( updatedPlayer )

  } catch(error: any) {
    res.status(500).send({
      status: "FAILED",
      message: "Error updating player",
      data: { error: error?.message || error },
    });
  }
      
};

const getAcolytes = async (req: any, res: any) => {
  try {
    const acolytes = await playerService.getAcolytes();
    if (acolytes.length === 0) {
      return res.status(404).send({message: "Acolytes not found"});
    }
    res.send( acolytes )

  } catch(error: any) {
    res.status(500).send({ 
      status: "FAILED",
      message: "Error fetching acolytes",
      data: { error: error?.message || error}
    });
  }

};

const playerController = {
  getMongoPlayer,
  getKaotikaPlayer,
  loginPlayer,
  loggedPlayer,
  getPlayer,
  updatePlayer,
  getAcolytes,
};

export default playerController;
