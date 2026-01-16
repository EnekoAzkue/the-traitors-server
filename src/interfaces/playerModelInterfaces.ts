

interface KaotikaUser {
  active: boolean,
  rol: string,
  socketId: string,
  pushToken: string,
  cardId: string,
  isInside: boolean,
  inTower: boolean,
  insideTower: boolean,
  inSwamp: boolean, 
  inHall: boolean,
  homeLocation: string | null, 
  attributes: Attributes,
  equipment: any,
  inventory: any,
  name: string,
  nickname: string,
  email: string,
  avatar: string,
  classroom_Id: string,
  level: number,
  experience: number,
  is_active: boolean,
  profile: any,
  tasks: any[],
  gold: number,
  created_date: string,
  isBetrayer: boolean,
  resistance: number,
  disease: string[],
  isCursed: boolean,
  originalAtributes: Attributes,
  skills: any[],
};


interface Attributes {
  intelligence: number,
  dexterity: number,
  charisma: number,
  constitution: number,
  strength: number,
  insanity: number,
};


interface EquippableItemGenericProperties {
  modifiers: Attributes,
  name: string,
  description: string,
  type: string,
  image: string,
  value: number,
  min_lvl: number,
};



export default KaotikaUser;