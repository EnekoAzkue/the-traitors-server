import { SocketEvents } from "../constants/constants";

export interface ServerToClientEvents {}

export interface ClientToServerEvents {
    [SocketEvents.CONNECTION_OPEN]: (arg: string) => void;
}
