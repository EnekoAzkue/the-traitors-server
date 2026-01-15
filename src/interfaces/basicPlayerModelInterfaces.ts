

interface BasicKaotikaUser {
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
  gold: number,
  tasks: any[],
  created_date: string,
  isBetrayer: boolean,
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



export default BasicKaotikaUser;

