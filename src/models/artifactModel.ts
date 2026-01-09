import mongoose from "mongoose";
import Artifact from "../interfaces/artifactModelInterfaces";

const { Schema } = mongoose;

const Coordinates = new Schema({
  x: Number,
  y: Number,
})

export const artifactSchema = new Schema<Artifact>({
  name: String,
  coordinates: Coordinates,
  image: String,
  icon: String,
  state: String,
});

export default mongoose.model<Artifact>("Artifact", artifactSchema);