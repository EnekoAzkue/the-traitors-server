import { Server, Socket } from "socket.io";
import { SocketEvents, EMAIL, PLAYER_ROLES } from "../../constants/constants";
import playerServices from '../../../services/playerServices';

// Delete:
import admin from 'firebase-admin';
import playerService from "../../../services/playerServices";



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

const checkPlayerGoesOutFromLab = async (player: any) => {
    const updatedPlayer = await playerServices.updatePlayer(player.email, { isInside: false });
    player.isInside = updatedPlayer.isInside;
};

// --- LAB ACCESS EVENT FUNCTIONS --- //
const manageLabAccessEvent = (socket: Socket) => {
    socket.on(SocketEvents.ACCESS_TO_EXIT_FROM_LAB, async (playerEmail: string) => {

        console.log(`Listerner detects ACCESS_TO_EXIT_FROM_LAB event from email: ${playerEmail}`);

        let updatedPlayer = await updatePlayerLabStance(playerEmail);

        // --- SEND UPDATED PLAYER TO CLIENT --- //
        const playerUser = await playerServices.getPlayer(playerEmail);


        if (playerUser?.socketId) {
            socket.to(playerUser?.socketId).emit(SocketEvents.UPDATE_USER_IN_CLIENT, playerUser);
            console.log(`SENDING UPDATED PLAYER TO CLIENT:  ${playerUser.name} `);
        } else {
            console.log("NOT SENDING UPDATED PLAYER TO CLIENT!!!");
        }




        // Una vez obtenido el socket de conexion de mortimer enviarle a la parte cliente de la conexión el acolito que ha sido modificado --> Es el player de este evento!!! 
        const mortimerUser = await getMortimerByEmail();

        console.log(`Mortimer user's name is: ${mortimerUser?.name} and its socket ID is: ${mortimerUser?.socketId}`);

        const mortimerConnectionId = mortimerUser?.socketId;

        if (mortimerConnectionId) {
            // Obtenido mortimer sabemos cual es su socket de conexion gracias a su propiedad socketID  

            socket.to(mortimerConnectionId).emit(SocketEvents.SEND_UPDATED_PLAYER_TO_MORTIMER, updatedPlayer);
            console.log(`Sending socket event to ${mortimerUser.name} `);

        } else {
            console.log("NOT SENDING UPDATED PLAYER MORTIMER!!!!");
        }


    });
};

const updatePlayerLabStance = async (playerEmail: string) => {
    console.log(`UPDATING LAB STANCE FOR PLAYER WITH EMAIL: ${playerEmail}...`);
    const player = await playerServices.getPlayer(playerEmail);
    const updatedPlayer = await playerServices.updatePlayer(playerEmail, { isInside: !player?.isInside });
    console.log(`Now the player with email: ${updatedPlayer.email} is${(updatedPlayer.isInside) ? " " : " NOT "}inside Angelo's Lab`);

    return player;
}

const getMortimerByEmail = async () => { // borrar el parametro
    const mortimerUser = await playerServices.getPlayer(EMAIL.MORTIMER);
    return mortimerUser;
}

const manageInTowerEvent = (socket: Socket) => {
    socket.on(SocketEvents.UPDATE_INTOWER, async (playerEmail: string, inTower: boolean) => {
        console.log('event recieved')
        const player = await playerServices.getPlayer(playerEmail);

        console.log(`${player?.name} `)
        const changes = {
            inTower: inTower
        }

        await playerServices.updatePlayer(playerEmail, changes)
    })
}

const manageUserUpdateEvent = (socket: Socket) => {
    socket.on(SocketEvents.UPDATE_USER_IN_DB, async (userEmail, changes) => {
        console.log("The changes are: ", changes);
        const updatedPlayer = await playerServices.updatePlayer(userEmail, changes);
        console.log(`Updated player by socket:\n`, updatedPlayer.name);

        // const sendToMortimerNotificationOfTowerDoorOpenSuccess = async () => {
        //     // const mortimer = await playerService.getPlayer();
        //     const userPlayer = await playerService.getPlayer('ignacio.ayaso@ikasle.aeg.eus');
        //     console.log("THE USER IS");
        //     console.log(userPlayer);
        //     if (userPlayer?.pushToken) {
        //         await admin.messaging().sendEachForMulticast({
        //             tokens: [userPlayer?.pushToken],
        //             notification: {
        //                 title: "Mortimer:",
        //                 body: "Basic Notification sended!!!",
        //                 imageUrl: 'https://my-cdn.com/app-logo.png',
        //             },
        //             data: {

        //             },
        //             apns: {
        //                 payload: {
        //                     aps: {
        //                         "contentAvailable": true,

        //                         priority: "high",
        //                     }
        //                 }
        //             }

        //         });

        //     }

        // };
        // sendToMortimerNotificationOfTowerDoorOpenSuccess();

        return updatedPlayer;
    });
}

const manageSocketConnections = (io: Server) => {
    io.on(SocketEvents.CONNECT, (socket) => {
        // --- OPEN CONNECTION --- //
        manageOpenConnectionEvent(socket);

        // --- CLOSE CONNECTION --- //
        manageCloseConnectionEvent(socket);

        // --- ANGELO'S LAB ACCESS CONTROL --- //
        manageLabAccessEvent(socket);

        // --- INTOWER TOGGLE --- //
        manageInTowerEvent(socket);

        // --- UPDATE USER --- //
        manageUserUpdateEvent(socket);
    });
};

export default manageSocketConnections;