import { Injectable } from '@nestjs/common';
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
  create(createFilmDto: CreateFilmDto) {
    return 'This action adds a new film';
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

    return { items, totalItems };
  }

  findOne(id: number) {
    return `This action returns a #${id} film`;
  }

  update(id: number, updateFilmDto: UpdateFilmDto) {
    return `This action updates a #${id} film`;
  }

  remove(id: number) {
    return `This action removes a #${id} film`;
  }
}
