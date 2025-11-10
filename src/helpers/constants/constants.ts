export enum SocketEvents {
    CONNECTION_OPEN = "connection open",
    CONNECTION_CLOSE = "connection close",
    CONNECT = "connect",
    ACCESS_TO_EXIT_FROM_LAB = "access to/exit from lab",
    SEND_UPDATED_PLAYER_TO_MORTIMER = "send updated player to mortimer",
    ACCESS_TO_EXIT_FROM_TOWER = 'access to/exit from tower',
    UPDATE_USER_IN_CLIENT = "update user in client",
    UPDATE_INTOWER = 'update inTower',
}

export enum MqttTopics {
    SERVO = 'servo',
    CODE = 'code'
}

export enum MqttEvents {
    CONNECT = 'connect',
    MESSAGE = 'message',
}

export const EMAIL = {
    VILLAIN:"ozarate@aeg.eus",
    MORTIMER:"oskar.calvo@aeg.eus",
    ISTVAN:"classcraft.daw2@aeg.eus",
    ACOLYTE:"@ikasle.aeg.eus"
}



export const PLAYER_ROLES = {
    VILLAIN: "villain",
    MORTIMER:"mortimer",
    ISTVAN:"istvan",
    ACOLYTE:"acolyte"
}