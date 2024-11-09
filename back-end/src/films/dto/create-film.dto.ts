import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateFilmDto {
  @IsNotEmpty({message: "O título do filme deve ser informado."})
  @IsString({message: "O título do filme deve ser uma string."})
  title: string;

  @IsNotEmpty({message: "O tipo do filme deve ser informado."})
  @IsString({message: "O tipo do filme deve ser uma string."})
  type: string;

  @IsNotEmpty({message: "Os gêneros do filme devem ser informados."})
  @IsString({message: "Os gêneros do filme devem ser uma string."})
  genres: string;

  @IsNotEmpty({message: "A média de rating do filme deve ser informada."})
  @IsString({message: "A média de rating do filme deve ser uma string."})
  averageRating: string;

  @IsNotEmpty({message: "O número de votos do filme deve ser informado."})
  @IsNumber({}, {message: "O número de votos do filme deve ser um número."})
  numVotes: number;

  @IsNotEmpty({message: "Ano de lançamento do filme deve ser informado."})
  @IsNumber({}, {message: "Ano de lançamento do filme deve ser um número."})
  releaseYear: number;
}
