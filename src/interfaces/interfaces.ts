import { SocketEvents } from "../helpers/constants/constants";

export interface ServerToClientEvents {
    [SocketEvents.SEND_UPDATED_PLAYER_TO_MORTIMER]: (arg: any) => void;
}

export interface ClientToServerEvents {
    [SocketEvents.CONNECTION_OPEN]: (arg: string) => void;
}
