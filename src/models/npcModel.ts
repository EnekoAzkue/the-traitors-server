import mongoose, { Schema } from "mongoose";
import NpcInterface from "../interfaces/npcModelInterfaces";

const npcSchema = new Schema<NpcInterface>({
  name        : String,
  isCaptured  : Boolean, 
  location    : String,
});

export default mongoose.model<NpcInterface>("Npc", npcSchema);