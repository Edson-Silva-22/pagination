import { Controller, Get, Post, Body, Param, Delete, Query, Put } from '@nestjs/common';
import { FilmsService } from './films.service';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { Pagination, PaginationType } from '../utils/decorators/pagination-decorator';
import { SearchFilmsDto } from './dto/searchFilms.dto';

@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Post()
  async create(@Body() createFilmDto: CreateFilmDto) {
    return await this.filmsService.create(createFilmDto);
  }

  @Get()
  async findAll(@Pagination() pagination: PaginationType, @Query() searchFilmsDto: SearchFilmsDto) {
    const { items, totalItems, page, rows } = await this.filmsService.findAll(searchFilmsDto, pagination);
    return { items, totalItems, page, rows };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.filmsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateFilmDto: UpdateFilmDto) {
    return await this.filmsService.update(id, updateFilmDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.filmsService.remove(id);
  }
}
