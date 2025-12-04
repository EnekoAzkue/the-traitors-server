export enum SocketEvents {
    CONNECTION_OPEN = "connection open",
    CONNECTION_CLOSE = "connection close",
    CONNECT = "connect",
    ACCESS_TO_EXIT_FROM_LAB = "access to/exit from lab",
    SEND_UPDATED_PLAYER_TO_MORTIMER = "send updated player to mortimer",
    ACCESS_TO_EXIT_FROM_TOWER = 'access to/exit from tower',
    UPDATE_USER_IN_CLIENT = "update user in client",
    UPDATE_INTOWER = 'update inTower',
    UPDATE_USER_IN_DB = 'update user in DB',
    SEND_FOUND_SCROLL = 'send found scroll',
    SEND_NOTIFICATION_TO_MORTIMER = "send notification to mortimer",
    SEND_NOTIFICATION_TO_ACOLYTES = "send notification to acolytes",
    SCROLL_VANISH = 'scroll vanish', // Evento enviado desde mortimer para enviar una notificación a todos los alumnos de que han sido convocados al "Hall of Sages". 
    RECIEVED_FOUND_SCROLL = 'recieved found scroll',
    REQUEST_ARTIFACTS = 'request artifacts',
    SENDING_ARTIFACTS = 'sending artifacts',
    COLLECT = 'collect',
    COLLECTED = 'collected',
    ENTER_EXIT_HALL = 'enter/exit hall',
    SHOW_ARTIFACTS = 'show artifacts',
    DISCARD_ARTIFACTS = 'discard artifacts',
    ACCEPT_ARTIFACTS = 'accept artifacts',
    SEARCH_FOR_ACOLYTES_IN_HALL = 'search for acolytes in hall',
    SENDING_ACOLYTES_IN_HALL = 'sending acolytes in hall',
    ACOLYTE_ENTERED_EXITED_HALL = 'acolyte entered/exited the hall',
}

export enum SocketTestEvents {
    TEST_GET_FCM_MESSAGE = "test get fcm message",
}

export enum MqttTopics {
    SERVO = 'thet-servo',
    CODE = 'code'
}

export enum MqttEvents {
    CONNECT = 'connect',
    MESSAGE = 'message',
}

export const EMAIL = {
    VILLAIN: "ozarate@aeg.eus",
    MORTIMER: "oskar.calvo@aeg.eus",
    ISTVAN: "classcraft.daw2@aeg.eus",
    ACOLYTE: "@ikasle.aeg.eus"
}



export const PLAYER_ROLES = {
    VILLAIN: "villain",
    MORTIMER: "mortimer",
    ISTVAN: "istvan",
    ACOLYTE: "acolyte"
}