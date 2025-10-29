import { Server, Socket } from "socket.io";
import { SocketEvents, EMAIL, PLAYER_ROLES } from "../../constants/constants";
import playerServices from '../../../services/playerServices';



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
    });
};

const deletePlayersSocketID = async (email: string) => {
    const updatedPlayer = await playerServices.updatePlayer(email, { socketId: "" }); // se borra la conexión -> se pierde el socketID
    console.log(`The Player with the email ${updatedPlayer.email} has closed connection (socketId: ${updatedPlayer.socketId})`);
    return updatedPlayer;
};

const checkPlayerGoesOutFromLab = async (player: any) => {
    const updatedPlayer = await playerServices.updatePlayer(player.email, { isInside: false }); // se borra la conexión -> se pierde el socketID
    player.isInside = updatedPlayer.isInside;
};

// --- LAB ACCESS EVENT FUNCTIONS --- //
const manageLabAccessEvent = (socket: Socket) => {
    socket.on(SocketEvents.ACCESS_TO_EXIT_FROM_LAB, async (playerEmail: string) => {
        let updatedPlayer = await updatePlayerLabStance(playerEmail);

        // Una vez obtenido el socket de conexion de mortimer enviarle a la parte cliente de la conexión el acolito que ha sido modificado --> Es el player de este evento!!! 
        const mortimerUser = await getMortimerByEmail();

        console.log(`Mortimer user's name is: ${mortimerUser?.name} and its socket ID is: ${mortimerUser?.socketId}`);

        const mortimerConnectionId = mortimerUser?.socketId;

        if (mortimerConnectionId) {
            // Obtenido mortimer sabemos cual es su socket de conexion gracias a su propiedad socketID  

            socket.to(mortimerConnectionId).emit(SocketEvents.SEND_UPDATED_PLAYER_TO_MORTIMER, updatedPlayer);
            console.log(`Sending socket event to ${mortimerUser.name} `);

        }


    });
};

const updatePlayerLabStance = async (playerEmail: string) => {

    const player = await playerServices.getPlayer(playerEmail);
    const updatedPlayer = await playerServices.updatePlayer(playerEmail, { isInside: !player?.isInside });
    console.log(`Now the player with email: ${updatedPlayer.email} is${(updatedPlayer.isInside) ? " " : " NOT "}inside Angelo's Lab`);

    return player;
}

const getMortimerByEmail = async () => { // borrar el parametro
    // const mortimerUser = await playerServices.getPlayer(EMAIL.MORTIMER);
    const mortimerUser = await playerServices.getPlayer("eneko.azkue@ikasle.aeg.eus"); // Hardcoded para que mortimer sea ignacio
    return mortimerUser;
}


const manageSocketConnections = (io: Server) => {
    io.on(SocketEvents.CONNECT, (socket) => {

        // --- OPEN CONNECTION --- //
        manageOpenConnectionEvent(socket);

        // --- CLOSE CONNECTION --- //
        manageCloseConnectionEvent(socket);

        // --- ANGELO'S LAB ACCESS CONTROL --- //
        manageLabAccessEvent(socket);
    });
};

export default manageSocketConnections;