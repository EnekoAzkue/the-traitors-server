import express from "express";
const router = express.Router();
import tokenMiddleware from "../middlewares/verifyData";
import playerController from "../controllers/playerController";
import playerService from "../services/playerServices";
import { sendNotification } from "../helpers/utilities/firebaseCloudMessaging/firebaseCloudMessaging";
import artifactController from "../controllers/artifactController";
import diseaseController from "../controllers/diseaseController";
import { authenticateJWT } from "../middlewares/auth.middleware";
import angeloController from "../controllers/angeloController";

// TESTISNG
router.get(
  "/player/kaotika",
  tokenMiddleware.verifyIdToken,
  playerController.getKaotikaPlayer
);

router.post(
  "/player/notify/:email",
  async (req, res) => {
    const { email } = req.params;
    const { title, body } = req.body;

    const user = await playerService.getPlayer(email);
    if (!user?.pushToken) {
      return res.status(404).json({ error: "User has no token" });
    }

    await sendNotification(user.pushToken, title, body);

    res.json({ message: "Notification sent" });
  }
);

// TESTING
router.get(
  "/player/mongo",
  tokenMiddleware.verifyIdToken,
  playerController.getMongoPlayer
);

router.post(
  "/player/log-in",
  tokenMiddleware.verifyIdToken,
  playerController.loginPlayer
);

router.post(
  "/player/logged-in",
  tokenMiddleware.verifyIdToken,
  playerController.loggedPlayer
);

router.get(
  "/player/get/:playerEmail",
  authenticateJWT,
  playerController.getPlayer
);

router.patch(
  "/player/update/:playerEmail",
  authenticateJWT,
  playerController.updatePlayer
)

router.get(
  "/player/get-acolytes",
  authenticateJWT,
  playerController.getAcolytes
)

router.get(
  "/player/getByCardId/:cardId",
  authenticateJWT,
  playerController.getByCardId
)

router.patch(
  "/player/updateInsideTower/:playerEmail",
  authenticateJWT,
  playerController.updateInsideTower
)

router.get(
  "/player/get-loyals",
  authenticateJWT,
  playerController.getLoyalAcolytes
)

router.get(
  "/player/get-betrayers",
  authenticateJWT,
  playerController.getBetrayerAcolytes
)

router.get(
  "/artifact/get-artifacts",
  authenticateJWT,
  artifactController.getArtifacts
)

router.get(
  "/disease/get-diseases",
  authenticateJWT,
  diseaseController.getDiseases
);

router.get(
  "/disease/getDiseaseByName/:diseaseName",
  authenticateJWT,
  diseaseController.getDiseaseByName
);  

router.get(
  "/angelo/get-angelo",
  angeloController.getAngelo
);

export default router;