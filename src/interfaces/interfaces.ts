import { SocketEvents } from "../helpers/constants/constants";

export interface ServerToClientEvents {
    [SocketEvents.SEND_UPDATED_PLAYER_TO_MORTIMER]: (arg: any) => void;
}

export interface ClientToServerEvents {
    [SocketEvents.CONNECTION_OPEN]: (arg: string) => void;
}

export enum Locations {
  HOME              = 'The Old School Home',
  LAB               = 'The Old School Lab',
  DUNGEON           = 'The Old School Dungeon',
  HALL_OF_SAGES     = 'Hall Of Sages',
  TOWER             = 'Tower',
  SWAMP             = 'Swamp',
  INN               = 'Inn of the Forgotten',
  OBITUARY          = 'Obituary',
  HOLLOW            = 'The Hollow of the Lost',
};