import express, { Router } from "express";
const router = express.Router();

import middleware from "../middlewares/verifyData";
import playerController from "../controllers/playerController";
import playerService from "../services/playerServices";
import { sendNotification } from "../helpers/utilities/firebaseCloudMessaging/firebaseCloudMessaging";
import artifactController from "../controllers/artifactController";

// TESTISNG
router.get(
  "player/kaotika",
  middleware.verifyIdToken,
  playerController.getKaotikaPlayer
);


router.post(
  "player/notify/:email",
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
  "player/mongo",
  middleware.verifyIdToken,
  playerController.getMongoPlayer
);

router.post(
  "player/log-in",
  middleware.verifyIdToken,
  playerController.loginPlayer
);

router.post(
  "player/logged-in",
  middleware.verifyIdToken,
  playerController.loggedPlayer
);

router.get(
  "player/get/:playerEmail",
  playerController.getPlayer
);

router.patch(
  "player/update/:playerEmail",
  playerController.updatePlayer
)

router.get(
  "player/get-acolytes",
  playerController.getAcolytes
)

router.get(
  "player/getByCardId/:cardId",
  playerController.getByCardId
)

router.patch(
  "player/updateInsideTower/:playerEmail",
  playerController.updateInsideTower
)

router.get(
  "artifacts/get-artifacts",
  artifactController.getArtifacts
)

export default router;