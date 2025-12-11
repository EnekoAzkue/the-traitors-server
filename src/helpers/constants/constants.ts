
export enum SocketEvents {
   
  // --- CLIENT TO SERVER SOCKECT EVENT DECLARATION --- //
  CONNECT                           = 'connect',
  COLLECT                           = 'collect',
  COLLECTED                         = 'collected',
  SCROLL_VANISH                     = 'scroll vanish', // Evento enviado desde mortimer para enviar una notificación a todos los alumnos de que han sido convocados al "Hall of Sages". 
  UPDATE_INTOWER                    = 'update inTower',
  CONNECTION_OPEN                   = 'connection open',
  CONNECTION_CLOSE                  = 'connection close',
  SEND_FOUND_SCROLL                 = 'send found scroll',
  UPDATE_USER_IN_DB                 = 'update user in DB',
  REQUEST_ARTIFACTS                 = 'request artifacts',
  SEND_ACOLYTES_COORDS              = 'send acolytes coords',
  REQUEST_SWAMP_ACOLYTES            = 'request swamp acolytes',
  ACCESS_TO_EXIT_FROM_LAB           = 'access to/exit from lab',
  SEND_NOTIFICATION_TO_MORTIMER     = 'send notification to mortimer',
  SEND_NOTIFICATION_TO_ACOLYTES     = 'send notification to acolytes',
  SHOW_ARTIFACTS                    = 'show artifacts',
  ENTER_EXIT_HALL                   = 'enter/exit hall',
  DISCARD_ARTIFACTS                 = 'discard artifacts',
  ACCEPT_ARTIFACTS                  = 'accept artifacts',
  SEARCH_FOR_ACOLYTES_IN_HALL       = 'search for acolytes in hall',
  END_SEARCH                        = 'end search',
  SEARCH_FOR_MORTIMER_IN_HALL       = 'search for mortimer in hall',
  MORTIMER_IN_HALL                  = 'mortimer in hall',
  
  // --- SERVER TO CLIENT SOCKECT EVENT DECLARATION --- //
  SENDING_ARTIFACTS                 = 'sending artifacts',
  RECIEVED_FOUND_SCROLL             = 'recieved found scroll',
  UPDATE_USER_IN_CLIENT             = 'update user in client',
  SENDING_ACOLYTES_IN_HALL          = 'sending acolytes in hall',
  SENDING_ACOLYES_IN_SWAMP          = 'sending acolytes in swamp',
  ACCESS_TO_EXIT_FROM_TOWER         = 'access to/exit from tower',
  SEND_UPDATED_PLAYER_TO_MORTIMER   = 'send updated player to mortimer',
  ACOLYTE_ENTERED_EXITED_HALL       = 'acolyte entered/exited the hall',
  SEND_ACOLYTE_NEW_COORDS           = 'sending acolytes in swamp coords',
  END_VALIDATION                    = 'end validation',
  SENDING_MORTIMER_IN_HALL          = 'sending mortimer in hall',
  MORTIMER_ENTERED_EXITED_HALL      = 'mortimer entered/exited hall',





};

export enum SocketTestEvents {
  TEST_GET_FCM_MESSAGE = "test get fcm message",
};

export enum MqttTopics {
  SERVO = 'thet-servo',
  CODE = 'code'
};

export enum MqttEvents {
  CONNECT = 'connect',
  MESSAGE = 'message',
};

export const EMAIL = {
  VILLAIN: "ozarate@aeg.eus",
  MORTIMER: "oskar.calvo@aeg.eus",
  ISTVAN: "classcraft.daw2@aeg.eus",
  ACOLYTE: "@ikasle.aeg.eus"
};

export const PLAYER_ROLES = {
  VILLAIN: "villain",
  MORTIMER: "mortimer",
  ISTVAN: "istvan",
  ACOLYTE: "acolyte"
};


export const MQTT_DOOR_MESSAGE = {
  OPEN: 'Open',
  DENY: 'Deny',
};