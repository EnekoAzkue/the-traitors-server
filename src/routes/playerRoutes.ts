import express, { Router } from "express";
const router = express.Router();

import middleware from "../middlewares/verifyData";
import playerController from "../controllers/playerController";
import playerService from "../services/playerServices";
import { sendNotification } from "../helpers/utilities/firebaseCloudMessaging/firebaseCloudMessaging";

// TESTISNG
router.get(
  "/kaotika",
  middleware.verifyIdToken,
  playerController.getKaotikaPlayer
);


router.post(
  "/notify/:email",
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
  "/mongo",
  middleware.verifyIdToken,
  playerController.getMongoPlayer
);

router.post(
  "/log-in",
  middleware.verifyIdToken,
  playerController.loginPlayer
);

router.post(
  "/logged-in",
  middleware.verifyIdToken,
  playerController.loggedPlayer
);

router.get(
  "/get/:playerEmail",
  playerController.getPlayer
);

router.patch(
  "/update/:playerEmail",
  playerController.updatePlayer
)

router.get(
  "/get-acolytes",
  playerController.getAcolytes
)

router.get(
  "/getByCardId/:cardId",
  playerController.getByCardId
)

router.patch(
  "/updateInsideTower/:playerEmail",
  playerController.updateInsideTower
)

export default router;