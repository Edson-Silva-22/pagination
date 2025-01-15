import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { SearchFilmsDto } from './dto/searchFilms.dto';
import { PaginationType } from 'src/utils/decorators/pagination-decorator';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Film } from './schemas/films';

@Injectable()
export class FilmsService {
  constructor(
    @InjectModel(Film.name) private readonly filmModel: Model<Film>
  ){}
  async create(createFilmDto: CreateFilmDto) {
    try {
      const filmExist = await this.filmModel.find({ title: createFilmDto.title })

      if (filmExist.length > 0) throw new BadRequestException('Já existe um filme com esse título');
      
      const createdFilm = await this.filmModel.create(createFilmDto)

      return createdFilm

    } catch (error) {
      console.error(error)
      if (error instanceof BadRequestException) throw error
      throw new InternalServerErrorException('Devido a um erro interno não foi possível registrar o filme.')
    }
  }

  async findAll(searchFilmsDto: SearchFilmsDto, pagination: PaginationType) {
    let { page, rows, sortBy, sortOrder } = pagination;

    // Objeto para acumular os filtros
    const filters: Record<string, any> = {};

    if (searchFilmsDto.title) {
      filters.title = { $regex: searchFilmsDto.title, $options: 'i' };
    }
    if (searchFilmsDto.type) {
      filters.type = { $regex: searchFilmsDto.type, $options: 'i' };
    }
    if (searchFilmsDto.genres) {
      filters.genres = { $regex: searchFilmsDto.genres, $options: 'i' };
    }
    if (searchFilmsDto.releaseYear) {
      filters.releaseYear = searchFilmsDto.releaseYear;
    }

    // Conta o total de itens sem `skip` e `limit`
    const totalItems = await this.filmModel.countDocuments(filters);

    // se usuário tentar buscar uma página além do total de items encontrados, volta para a primeira página
    if(page > Math.ceil(totalItems / rows)) page = 1

    // Aplica os filtros, paginação e ordenação na consulta principal
    const items = await this.filmModel
      .find(filters)
      .sort(JSON.parse(`{ "${sortBy}": ${sortOrder} }`))
      .skip((page - 1) * rows)
      .limit(rows)
      .exec();

    return { items, totalItems, page, rows };
  }

  async findOne(id: string) {
    try {
      const findFilm = await this.filmModel.findById(id)
      if (!findFilm) throw new BadRequestException('Filme não encontrado');
      return findFilm;
    } catch (error) {
      console.error(error)
      if (error instanceof BadRequestException) throw error
      throw new InternalServerErrorException('Devido a um erro interno não foi possível buscar o filme.');
    }
  }

  async update(id: string, updateFilmDto: UpdateFilmDto) {
    try {
      const findFilm = await this.filmModel.findByIdAndUpdate(id, updateFilmDto, { new: true })
      if (!findFilm) throw new BadRequestException('Filme não encontrado');
      return findFilm;
    } catch (error) {
      console.error(error)
      if (error instanceof BadRequestException) throw error
      throw new InternalServerErrorException('Devido a um erro interno não foi possível atualizar o filme.');
    }
  }

  async remove(id: string) {
    try {
      const findFilm = await this.filmModel.findByIdAndDelete(id)
      if (!findFilm) throw new BadRequestException('Filme não encontrado');
      return findFilm;
    } catch (error) {
      console.error(error)
      if (error instanceof BadRequestException) throw error
      throw new InternalServerErrorException('Devido a um erro interno não foi possível excluir o filme.');
    }
  }
}
