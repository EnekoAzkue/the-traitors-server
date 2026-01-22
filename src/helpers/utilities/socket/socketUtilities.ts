import { Server, Socket } from "socket.io";
import { SocketEvents, EMAIL, PLAYER_ROLES, SocketTestEvents, SOCKET_ROOMS, DiseasesNames } from "../../constants/constants";
import playerServices from '../../../services/playerServices';
import KaotikaUser from "../../../interfaces/playerModelInterfaces";
import { sendNotification, sendNotificationToAllAcolytes} from "../firebaseCloudMessaging/firebaseCloudMessaging";
import artifactServices from "../../../services/artifactServices";
import Artifact from "../../../interfaces/artifactModelInterfaces";
import { sendNotificationToMortimer } from "./socketHandlers";
import angeloServices from "../../../services/angeloServices";
import { Locations } from "../../../interfaces/interfaces";

// --- CONNECTION OPEN EVENT FUNCTIONS --- //
const manageOpenConnectionEvent = (socket: Socket) => {
    socket.on(SocketEvents.CONNECTION_OPEN, async (email: string) => {
        const updatedPlayer = await playerServices.updatePlayer(email, { socketId: socket.id });
        console.log(`Player with email ${updatedPlayer.email} opened connection (socketId: ${updatedPlayer.socketId})`);
        console.log("Conectado:", socket.id, "Rol:", updatedPlayer?.rol)
        if (updatedPlayer?.rol === PLAYER_ROLES.ACOLYTE) {
            socket.join(SOCKET_ROOMS.ACOLYTES)
            console.log("AÑADIDO A SALA:", SOCKET_ROOMS.ACOLYTES)
        }
    });
};

// --- CONNECTION CLOSE EVENT FUNCTIONS --- ///
const manageCloseConnectionEvent = (socket: Socket) => {
    socket.on(SocketEvents.CONNECTION_CLOSE, async (email: string) => {
        const updatedPlayer = await deletePlayersSocketID(email);
        await checkPlayerGoesOutFromLab(updatedPlayer);
        socket.disconnect(true);
    });
};

const deletePlayersSocketID = async (email: string) => {
    const player = await playerServices.getPlayer(email);
    console.log(`The Player with the email ${player?.email} has closed connection (socketId: ${player?.socketId})`);
    const updatedPlayer = await playerServices.updatePlayer(email, { socketId: "", pushToken: "" }); // se borra la conexión -> se pierde el socketID
    return updatedPlayer;
};

const checkPlayerGoesOutFromLab = async (player: KaotikaUser) => {
    const updatedPlayer = await playerServices.updatePlayer(player.email, { isInside: false });
    player.isInside = updatedPlayer.isInside;
};

// --- LAB ACCESS EVENT FUNCTIONS --- //
const manageLabAccessEvent = (socket: Socket) => {
    socket.on(SocketEvents.ACCESS_TO_EXIT_FROM_LAB, async (playerEmail: string) => {

        let updatedPlayer = await updatePlayerLabStance(playerEmail);

        // --- SEND UPDATED PLAYER TO CLIENT --- //
        const playerUser = await playerServices.getPlayer(playerEmail);


        if (playerUser?.socketId) {
            socket.to(playerUser?.socketId).emit(SocketEvents.UPDATE_USER_IN_CLIENT, playerUser);
        } else {
            console.log("Couldn't sent updated player to Client.");
        }

        const mortimerUser = await getMortimerByEmail();


        const mortimerConnectionId = mortimerUser?.socketId;

        if (mortimerConnectionId) {
            // Obtenido mortimer sabemos cual es su socket de conexion gracias a su propiedad socketID  

            socket.to(mortimerConnectionId).emit(SocketEvents.SEND_UPDATED_PLAYER_TO_MORTIMER, updatedPlayer);
        } else {
            console.log("Couldn't sent updated player to Mortimer.");
        }
    });
};

const updatePlayerLabStance = async (playerEmail: string) => {
    const player = await playerServices.getPlayer(playerEmail);
    const updatedPlayer = await playerServices.updatePlayer(playerEmail, { isInside: !player?.isInside });

    return player;
}

const getMortimerByEmail = async () => {
    const mortimerUser = await playerServices.getPlayer(EMAIL.MORTIMER);
    return mortimerUser;
}

const manageInTowerEvent = (socket: Socket) => {
    socket.on(SocketEvents.UPDATE_INTOWER, async (playerEmail: string, inTower: boolean) => {
        const player = await playerServices.getPlayer(playerEmail);
        const changes = { inTower: inTower };
        const updatedPlayer = await playerServices.updatePlayer(playerEmail, changes);
    });
};

const manageUserUpdateEvent = (socket: Socket) => {
    socket.on(SocketEvents.UPDATE_USER_IN_DB, async (userEmail, changes) => {
        const updatedPlayer = await playerServices.updatePlayer(userEmail, changes);
        return updatedPlayer;
    });
}

const manageTestOfFCM_Message = (socket: Socket) => {
    socket.on(SocketTestEvents.TEST_GET_FCM_MESSAGE, async (getSuccesfully: boolean) => {

        const kaotikaUser = await playerServices.getBySocketId(socket.id);
        const notification = { title: "", body: "", };

        sendNotification(kaotikaUser?.pushToken, notification.title, notification.body);

    });
};

const manageMortimerNotificationEvent = (socket: Socket) => {
    socket.on(SocketEvents.SEND_NOTIFICATION_TO_MORTIMER, async (message: any) => {
        sendNotificationToMortimer(message)
    });

    socket.on(SocketEvents.SEND_FOUND_SCROLL, async () => {
        const mortimer = await playerServices.getMortimerUser();
        if (mortimer?.socketId) {
            socket.to(mortimer?.socketId).emit(SocketEvents.RECIEVED_FOUND_SCROLL);
        }
    });

    socket.on(SocketEvents.SCROLL_VANISH, (message: any) => {
        sendNotificationToAllAcolytes(message?.notification?.title, message?.notification?.body);
    });
};

const manageArtifactsEvent = (io: Server, socket: Socket) => {

    socket.on(SocketEvents.REQUEST_ARTIFACTS, async (playerRol: string) => {
        if (playerRol === "acolyte" || playerRol === "mortimer") {
            await artifactServices.activateArtifacts()
            const artifacts: Artifact[] = await artifactServices.getArtifacts();
            socket.emit(SocketEvents.SENDING_ARTIFACTS, artifacts)
        }
    })

    socket.on(SocketEvents.COLLECT, async (artifactName: string) => {
        await artifactServices.collectArtifact(artifactName);
        io.emit(SocketEvents.COLLECTED);
    })

    socket.on(SocketEvents.DISCARD_ARTIFACTS, async () => {
        await artifactServices.endSearch();
        io.emit(SocketEvents.END_VALIDATION, { accepted: false });
    });

    socket.on(SocketEvents.ACCEPT_ARTIFACTS, async () => {
        io.emit(SocketEvents.END_VALIDATION, { accepted: true });
    });

}

const manageInSwampAcolytesRequest = (io: Server, socket: Socket) => {
    socket.on(SocketEvents.REQUEST_SWAMP_ACOLYTES, async () => {
        const acolytes: KaotikaUser[] = await playerServices.getAllAcolytesInSwamp();
        socket.emit(SocketEvents.SENDING_ACOLYES_IN_SWAMP, acolytes);
    });

    socket.on(SocketEvents.SEND_ACOLYTES_COORDS, (userCoords) => {
        io.emit(SocketEvents.SEND_ACOLYTE_NEW_COORDS, userCoords);
    });
}

const manageAcolyteInHall = (io: Server, socket: Socket) => {
    socket.on(SocketEvents.ENTER_EXIT_HALL, async (acolyteEmail: string, inHallChange: boolean) => {
        io.emit(SocketEvents.ACOLYTE_ENTERED_EXITED_HALL);
        const updatedAcolyte = await playerServices.updatePlayer(acolyteEmail, { inHall: inHallChange });
        if (updatedAcolyte.inHall) {
            const acolytes = await playerServices.getAcolytes();
            const acolytesInHall = acolytes.filter((acolyte) => acolyte.inHall);
            if (acolytesInHall.length === acolytes.length) {
                const message = { notification: { title: "All acolytes in hall", body: "You've been summoned to the Hall of Sages." } }
                sendNotificationToMortimer(message)
            } else if (acolytesInHall.length !== acolytes.length) {
            }
        }
    });

    socket.on(SocketEvents.SHOW_ARTIFACTS, async () => {
            console.log("SALAS DEL SOCKET:", socket.rooms);

        const artifacts: Artifact[] = await artifactServices.getArtifacts();
        const mortimer = await playerServices.getMortimerUser();
        if (mortimer?.socketId) {
            socket.to(mortimer?.socketId).emit(SocketEvents.SENDING_ARTIFACTS, artifacts);
        }
        io.to(SOCKET_ROOMS.ACOLYTES).emit(SocketEvents.SHOWING_ARTIFACS)
    });

    socket.on(SocketEvents.SEARCH_FOR_ACOLYTES_IN_HALL, async () => {
        const acolytes = await playerServices.getAcolytes();
        const acolytesInHall = acolytes.filter((acolyte) => acolyte.inHall);
        socket.emit(SocketEvents.SENDING_ACOLYTES_IN_HALL, acolytesInHall);
    })

    socket.on(SocketEvents.MORTIMER_IN_HALL, async (inHall: boolean) => {
      try{
        const mortimer = await playerServices.getMortimerUser();
        if(mortimer) {
          await playerServices.updatePlayer(mortimer.email, { inHall: inHall });
          io.emit(SocketEvents.MORTIMER_ENTERED_EXITED_HALL);
        }else{
          throw new Error('There is no user with mortimer ron in DB.');
        }

      }catch(error:any){
        console.error(`Error happened while resolve MORTIMER_IN_HALL event...\n${error}`);
      }
    });

    socket.on(SocketEvents.SEARCH_FOR_MORTIMER_IN_HALL, async () => {
        const mortimer = await playerServices.getMortimerUser();
        socket.emit(SocketEvents.SENDING_MORTIMER_IN_HALL, mortimer?.inHall);
    })
};

const manageBetrayal = (io: Server, socket: Socket) => {
    socket.on(SocketEvents.BETRAYAL, async () => {
        const betrayers = await playerServices.getBetrayerAcolytes()
        const loyals = await playerServices.getLoyalAcolytes()
        io.emit(SocketEvents.UPDATE_TRAITORS, [betrayers, loyals])
    }) 
}

const manageRest = (io: Server, socket: Socket) => {
  socket.on(SocketEvents.REST, async (player: KaotikaUser) => {
    const restedPlayer = await playerServices.rest(player)
    const mortimer = await playerServices.getMortimerUser()
    
    if (restedPlayer?.socketId) {
      io.to(restedPlayer?.socketId).emit(SocketEvents.RESTED, restedPlayer)
    }
    if (mortimer?.socketId) {
      io.to(mortimer?.socketId).emit(SocketEvents.RESTED, restedPlayer)
    }
  })
}

const manageHeal = (io: Server, socket: Socket) => {
  socket.on(SocketEvents.HEAL, async (player: KaotikaUser, cure: string) => {
    const healedPlayer = await playerServices.heal(player, cure)
    const mortimer = await playerServices.getMortimerUser()
    if (mortimer?.socketId) {
      console.log(`sending it to ${mortimer?.name}(${mortimer?.socketId})`)
      io.to(mortimer?.socketId).emit(SocketEvents.HEALED, healedPlayer)
    }
    if (healedPlayer?.socketId) {
      console.log('healed player', healedPlayer?.email)
      io.to(healedPlayer?.socketId).emit(SocketEvents.HEALED, healedPlayer)
    }
  })
}

const manageCurse = (io: Server, socket: Socket) => {
  socket.on(SocketEvents.CURSE, async (player: KaotikaUser) => {
    const cursededPlayer = await playerServices.curse(player);
    const mortimer = await playerServices.getMortimerUser();
    const istvan = await playerServices.getIstvanUser();

    if (cursededPlayer?.socketId) {
        io.to(cursededPlayer?.socketId).emit(SocketEvents.CURSED, cursededPlayer)
    }
    if (mortimer?.socketId) {
        io.to(mortimer?.socketId).emit(SocketEvents.CURSED, cursededPlayer)
    }
    if (istvan?.socketId) {
        io.to(istvan?.socketId).emit(SocketEvents.CURSED, cursededPlayer)
    }
  })
}

const manageInfect = (io: Server, socket: Socket) => {
  socket.on(SocketEvents.INFECT, async (player: KaotikaUser, illness: DiseasesNames) => {
    const infectedPlayer = await playerServices.infect(player, illness)
    const mortimer = await playerServices.getMortimerUser()
    const villain = await playerServices.getVillainUser()

    if (infectedPlayer?.socketId) {
        io.to(infectedPlayer?.socketId).emit(SocketEvents.INFECTED, infectedPlayer)
    }
    if (mortimer?.socketId) {
        io.to(mortimer?.socketId).emit(SocketEvents.INFECTED, infectedPlayer)
    }
    if (villain?.socketId) {
        io.to(villain?.socketId).emit(SocketEvents.INFECTED, infectedPlayer)
    }
  });
}

const manageAngeloCapture = (io: Server, socket: Socket) => {
  socket.on(SocketEvents.CAPTURE_ANGELO, async () => {
    const capturedAngelo = await angeloServices.updateAngelo({location: Locations.HALL_OF_SAGES});
    io.emit(SocketEvents.CAPTURED_ANGELO, capturedAngelo);
  });

  socket.on(SocketEvents.RELEASE_ANGELO, async() => {
    const releasedAngelo = await angeloServices.updateAngelo({location: Locations.UNKNOWN});
    io.emit(SocketEvents.RELEASED_ANGELO, releasedAngelo);
  });

  socket.on(SocketEvents.DELIVER_ANGELO, async () => {
    const deliveredAngelo = await angeloServices.updateAngelo({isCaptured: true, location: Locations.DUNGEON});
    io.emit(SocketEvents.DELIVERED_ANGELO, deliveredAngelo);
  });

  socket.on(SocketEvents.VOTE, async (vote: boolean) => {
    const mortimer = await playerServices.getMortimerUser();

    if (mortimer?.socketId) {
        io.to(mortimer?.socketId).emit(SocketEvents.VOTATION, vote) 
    }

  });

  socket.on(SocketEvents.START_TRIAL, async () => {
    io.emit(SocketEvents.TRIAL_STARTED)
  })

  socket.on(SocketEvents.RESET_TRIAL, () => {
    io.emit(SocketEvents.TRIAL_RESETED)
  })

  socket.on(SocketEvents.END_TRIAL, () => {
    io.emit(SocketEvents.TRIAL_ENDED)
  })
}

const manageSocketConnections = (io: Server) => {

    io.on("connection", async (socket) => {

        // --- OPEN CONNECTION --- //
        manageOpenConnectionEvent(socket);

        // --- CLOSE CONNECTION --- //
        manageCloseConnectionEvent(socket);

        // --- ANGELO'S LAB ACCESS CONTROL --- //
        manageLabAccessEvent(socket);

        // --- INTOWER TOGGLE --- //
        // manageInTowerEvent(socket);

        // --- UPDATE USER --- //
        manageUserUpdateEvent(socket);

        // --- MANAGE ARTIFACTS --- //
        manageArtifactsEvent(io, socket);

        // --- MANAGE IN SWAMP ACOLYTES REQUEST --- //
        manageInSwampAcolytesRequest(io, socket);

        // --- TESTING --- //
        // --- Socket to notify user with fcm --- //
        manageTestOfFCM_Message(socket);

        manageMortimerNotificationEvent(socket);

        manageAcolyteInHall(io, socket);

        manageBetrayal(io, socket);

        manageRest(io, socket);

        manageHeal(io, socket);

        manageCurse(io, socket);

        manageInfect(io, socket);

        manageAngeloCapture(io, socket);
      });
};

export default manageSocketConnections;