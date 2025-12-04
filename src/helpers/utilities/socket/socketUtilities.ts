import { Server, Socket } from "socket.io";
import { SocketEvents, EMAIL, PLAYER_ROLES, SocketTestEvents } from "../../constants/constants";
import playerServices from '../../../services/playerServices';
import KaotikaUser from "../../../interfaces/playerModelInterfaces";
import { sendNotification, sendNotificationToAllAcolytes, sendScrollNotification } from "../firebaseCloudMessaging/firebaseCloudMessaging";
import artifactServices from "../../../services/artifactServices";
import Artifact from "../../../interfaces/artifactModelInterfaces";
import { sendNotificationToMortimer } from "./socketHandlers";

// --- CONNECTION OPEN EVENT FUNCTIONS --- //
const manageOpenConnectionEvent = (socket: Socket) => {
    socket.on(SocketEvents.CONNECTION_OPEN, async (email: string) => {
        const updatedPlayer = await playerServices.updatePlayer(email, { socketId: socket.id });
        console.log(`Player with email ${updatedPlayer.email} opened connection (socketId: ${updatedPlayer.socketId})`);
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
        //Send notification to acolytes that artifacts have been discarded
    });

    socket.on(SocketEvents.ACCEPT_ARTIFACTS, async () => {
        await artifactServices.endSearch();
        //Send notification to acolytes that artifacts have been accepted
    });

}

const manageInSwampAcolytesRequest = (io: Server, socket: Socket) => {
    socket.on(SocketEvents.REQUEST_SWAMP_ACOLYTES, async () => {
        const acolytes: KaotikaUser[] = await playerServices.getAllAcolytesInSwamp();
        socket.emit(SocketEvents.SENDING_ACOLYES_IN_SWAMP, acolytes);
    });

    socket.on(SocketEvents.SEND_ACOLYTES_COORDS, ( userCoords ) => {
        io.emit(SocketEvents.SEND_ACOLYTE_NEW_COORDS, userCoords);
    });
}

const manageAcolyteInHall = (io: Server, socket: Socket) => {
    socket.on(SocketEvents.ENTER_EXIT_HALL, async (acolyteEmail: string, inHallChange: boolean) => {
        io.emit(SocketEvents.ACOLYTE_ENTERED_EXITED_HALL);
        const updatedAcolyte = await playerServices.updatePlayer(acolyteEmail, { inHall: inHallChange });
        console.log(`Acolyte with email ${acolyteEmail} entered/exited the hall. inHall: ${updatedAcolyte.inHall}`);
        if (updatedAcolyte.inHall) {
            const acolytes = await playerServices.getAcolytes();
            const acolytesInHall = acolytes.filter((acolyte) => acolyte.inHall);
            if (acolytesInHall.length === acolytes.length) {
                console.log('All acolytes in hall')
                const message = {notification: { title: "All acolytes in hall", body: "You've been summoned to the Hall of Sages." }}
                sendNotificationToMortimer(message)
            } else if (acolytesInHall.length !== acolytes.length) {
                console.log('There are acolytes outside the hall still');
            }
        }
    });

    socket.on(SocketEvents.SHOW_ARTIFACTS, async () => {
        const artifacts: Artifact[] = await artifactServices.getArtifacts();
        socket.emit(SocketEvents.SENDING_ARTIFACTS, artifacts)
    });

    socket.on(SocketEvents.SEARCH_FOR_ACOLYTES_IN_HALL, async () => {
        console.log('Searching for acolytes in hall...', socket.id);
        const acolytes = await playerServices.getAcolytes();
        const acolytesInHall = acolytes.filter((acolyte) => acolyte.inHall);
        socket.emit(SocketEvents.SENDING_ACOLYTES_IN_HALL, acolytesInHall);
    })
};

const manageSocketConnections = (io: Server) => {

    io.on("connection", (socket) => {

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

        manageAcolyteInHall(io, socket)
    });
};

export default manageSocketConnections;