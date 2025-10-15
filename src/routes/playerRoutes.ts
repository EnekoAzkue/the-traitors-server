import express, { Router } from "express";
const router = express.Router();

import middleware from "../middlewares/verifyData";
import playerController from "../controllers/playerController";

// TESTISNG
router.get(
  "/kaotika",
  middleware.verifyIdToken,       
  playerController.getKaotikaPlayer
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

export default router;