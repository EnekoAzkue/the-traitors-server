import mongoose from "mongoose";
const { Schema } = mongoose;
const ObjectId = mongoose.Types.ObjectId;

const skillSchema = new Schema({
  skill: ObjectId,
  activeLevels: [],
});

const taskSchema = new Schema({
  classroomId: String,
  courseWorkName: String,
  grade: Number,
  selectedAssignment: String,
  maxPoints: {
    type: Number,
    required: false,
  },
});

const attributeSchema = new Schema({
  name: String,
  description: String,
  value: Number,
});

const profileSchema = new Schema({
  name: String,
  description: String,
  image: String,
  attributes: [attributeSchema],
});

const commonEquipmentFields = {
  name: String,
  description: String,
  type: String,
  image: String,
  value: Number,
  min_lvl: Number,
};

const commonAttributesAndModifiersSchema = new Schema(
  {
    intelligence: Number,
    dexterity: Number,
    charisma: Number,
    constitution: Number,
    strength: Number,
    insanity: Number,
  },
  { _id: false }
);

const enhancerPotionSchema = new Schema({
  modifiers: commonAttributesAndModifiersSchema,
  ...commonEquipmentFields,
  duration: Number,
});

const healingPotionSchema = new Schema({
  modifiers: {
    type: {
      hit_points: Number,
      intelligence: Number,
      dexterity: Number,
      charisma: Number,
      constitution: Number,
      strength: Number,
      insanity: Number,
      _id: false,
    },
  },
  ...commonEquipmentFields,
});

const recoveryEffectSchema = new Schema({
  modifiers: {
    type: {
      hit_points: Number,
      intelligence: Number,
      dexterity: Number,
      charisma: Number,
      constitution: Number,
      strength: Number,
      insanity: Number,
      _id: false,
    },
  },
  name: String,
  description: String,
  type: String,
  antidote_effects: [String],
  poison_effects: [String],
});

const antidotePotionSchema = new Schema({
  ...commonEquipmentFields,
  recovery_effect: recoveryEffectSchema,
});

const ringSchema = new Schema({
  modifiers: commonAttributesAndModifiersSchema,
  ...commonEquipmentFields,
  isUnique: Boolean,
  isActive: Boolean,
});

const bootSchema = new Schema({
  modifiers: commonAttributesAndModifiersSchema,
  ...commonEquipmentFields,
  defense: Number,
  isActive: Boolean,
  isUnique: Boolean,
});

const artifactSchema = new Schema({
  modifiers: commonAttributesAndModifiersSchema,
  ...commonEquipmentFields,
  isActive: Boolean,
  isUnique: Boolean,
});

const shieldSchema = new Schema({
  modifiers: commonAttributesAndModifiersSchema,
  ...commonEquipmentFields,
  defense: Number,
  isUnique: Boolean,
  isActive: Boolean,
});

const armorSchema = new Schema({
  modifiers: commonAttributesAndModifiersSchema,
  ...commonEquipmentFields,
  defense: Number,
  isUnique: Boolean,
  isActive: Boolean,
});

const weaponSchema = new Schema({
  modifiers: commonAttributesAndModifiersSchema,
  ...commonEquipmentFields,
  base_percentage: Number,
  die_faces: Number,
  die_modifier: Number,
  die_num: Number,
  isUnique: Boolean,
  isActive: Boolean,
});

const helmetSchema = new Schema({
  modifiers: commonAttributesAndModifiersSchema,
  ...commonEquipmentFields,
  defense: Number,
  isUnique: Boolean,
  isActive: Boolean,
});

const equipmentSchema = new Schema(
  {
    helmet: helmetSchema,
    weapon: weaponSchema,
    armor: armorSchema,
    shield: shieldSchema,
    artifact: artifactSchema,
    boot: bootSchema,
    ring: ringSchema,
    antidote_potion: antidotePotionSchema,
    healing_potion: healingPotionSchema,
    enhancer_potion: enhancerPotionSchema,
  },
  { _id: false }
);

const ingredientSchema = new Schema({
  name: String,
  description: String,
  value: Number,
  effects: [String],
  image: String,
  type: String,
  qty: Number,
});

const inventorySchema = new Schema(
  {
    helmets: [helmetSchema],
    weapons: [weaponSchema],
    armors: [armorSchema],
    shields: [shieldSchema],
    artifacts: [artifactSchema],
    boots: [bootSchema],
    rings: [ringSchema],
    antidote_potions: [antidotePotionSchema],
    healing_potions: [healingPotionSchema],
    enhancer_potions: [enhancerPotionSchema],
    ingredients: [ingredientSchema],
  },
  { _id: false }
);

const playerSchema = new Schema({
  active: Boolean,
  rol: String,
  socketId: String,
  isInside: Boolean,
  attributes: commonAttributesAndModifiersSchema,
  equipment: equipmentSchema,
  inventory: inventorySchema,
  name: String,
  nickname: String,
  email: String,
  avatar: String,
  classroom_Id: String,
  level: Number,
  experience: Number,
  is_active: Boolean,
  profile: profileSchema,
  tasks: [taskSchema],
  gold: Number,
  created_date: String,
  isBetrayer: Boolean,
  skills: [skillSchema],
});

export default mongoose.model("Player", playerSchema);