import { DiseasesNames } from "../helpers/constants/constants";

interface Disease {
  name: DiseasesNames,
  attributeDebuffsByPercent: {
    intelligence  : number,
    dexterity     : number,
    charisma      : number,
    constitution  : number,
    strength      : number,
    insanity      : number,
  }
};

export default Disease;