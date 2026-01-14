
interface Disease {
  name: String,
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