import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";

// export const filmsSchema = new mongoose.Schema({
//   title: String,
//   type: String,
//   genres: String,
//   averageRating: String,
//   numVotes: Number,
//   releaseYear: Number,
// }, {collection: 'films', timestamps: true})

// const Film = mongoose.model('Film', filmsSchema)
// export default 
@Schema({
  timestamps: true
})
export class Film {
  @Prop({
    required: true,
    unique: true
  })
  title: string;

  @Prop({
    required: true
  })
  type: string;

  @Prop({required: true})
  genres: string;

  @Prop({required: true})
  averageRating: string;

  @Prop({required: true})
  numVotes: number;

  @Prop({required: true})
  releaseYear: number;
}

export const FilmSchema = SchemaFactory.createForClass(Film)