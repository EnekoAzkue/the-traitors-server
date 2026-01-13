import cron from "node-cron";
import { Server } from "socket.io";
import { CRON_SCHEDULES } from "../../constants/constants";
import KaotikaUser from "../../../interfaces/playerModelInterfaces";

// --- CRON TASKS --- //

function executeDarkHeartbeat(player: KaotikaUser){

};

function reducePlayerResistance(player: KaotikaUser){

}

function increasePlayerInsanityBasedOnResistanceReducement(player: KaotikaUser){

}

// --- CRON MANAGEMENT --- //

export default function manageCronTasks(io: Server){
  cron.schedule(CRON_SCHEDULES.TESTING, () => {
    console.log(`Ejecutando cada minuto!!! ${new Date()}`);
  });
}