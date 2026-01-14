import mongoose from "mongoose";
import Disease from "../interfaces/diseaseModelInterfaces";

const { Schema } = mongoose;

export const diseaseSchema = new Schema<Disease>({
  name: String,
  attributeDebuffsByPercent: {
    intelligence  : Number,
    dexterity     : Number,
    charisma      : Number,
    constitution  : Number,
    strength      : Number,
    insanity      : Number,
  }
}); 


export default mongoose.model<Disease>("Disease", diseaseSchema);