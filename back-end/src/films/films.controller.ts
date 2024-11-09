import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { FilmsService } from './films.service';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { Pagination, PaginationType } from 'src/utils/decorators/pagination-decorator';
import { SearchFilmsDto } from './dto/searchFilms.dto';

@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Post()
  create(@Body() createFilmDto: CreateFilmDto) {
    return this.filmsService.create(createFilmDto);
  }

  @Get()
  async findAll(@Pagination() pagination: PaginationType, @Query() searchFilmsDto: SearchFilmsDto) {
    const { items, totalItems } = await this.filmsService.findAll(searchFilmsDto, pagination);
    const { page, rows } = pagination;
    return { items, totalItems, page, rows };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filmsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFilmDto: UpdateFilmDto) {
    return this.filmsService.update(+id, updateFilmDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filmsService.remove(+id);
  }
}
