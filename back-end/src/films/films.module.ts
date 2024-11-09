import { Module } from '@nestjs/common';
import { FilmsService } from './films.service';
import { FilmsController } from './films.controller';
import { MongooseModule } from '@nestjs/mongoose';
// import { filmsSchema } from './schemas/films';
// import Film from './schemas/films';
import { FilmSchema } from './schemas/films';
import { Film } from './schemas/films';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Film.name, schema: FilmSchema}
    ])
  ],
  controllers: [FilmsController],
  providers: [FilmsService],
})
export class FilmsModule {}
