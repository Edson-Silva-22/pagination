import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { FilmsService } from '../films.service';
import { Model } from 'mongoose';
import { Film } from '../schemas/films';
import { CreateFilmDto } from '../dto/create-film.dto';
import { BadRequestException } from '@nestjs/common';
import { UpdateFilmDto } from '../dto/update-film.dto';

describe('FilmService', () => {
  let service: FilmsService;
  let model: Model<Film>;
  // Mock para o objeto retornado por `find()`
  const queryMock = {
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn(),
    clone: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilmsService,
        {
          provide: getModelToken(Film.name),
          useValue: {
            create: jest.fn().mockReturnThis(),
            find: jest.fn().mockReturnThis(),
            findById: jest.fn().mockReturnThis(),
            findByIdAndUpdate: jest.fn().mockReturnThis(),
            findByIdAndDelete: jest.fn().mockReturnThis(),
            countDocuments: jest.fn(),
            
          },
        },
      ],
    }).compile();

    service = module.get<FilmsService>(FilmsService);
    model = module.get<Model<Film>>(getModelToken(Film.name));

    (model.find as jest.Mock).mockReturnValue(queryMock);
  });

  describe('Method Create', () => {
    const createFilmDto: CreateFilmDto = { title: 'example movie', type: 'Drama', genres: 'action', averageRating: '8.5', numVotes: 1000, releaseYear: 2022 };

    it('deve salvar um filme corretamente', async () => {

      (model.find as jest.Mock).mockResolvedValueOnce([]);
      (model.create as jest.Mock).mockResolvedValueOnce(createFilmDto);

      const result = await service.create(createFilmDto);

      expect(model.find).toHaveBeenCalledWith({title: createFilmDto.title})
      expect(model.create).toHaveBeenCalledWith(createFilmDto);
      expect(result).toEqual(createFilmDto);
    })

    it('deve lançar BadRequestException se já existir um filme com o mesmo título', async () => {
      (model.find as jest.Mock).mockResolvedValueOnce([createFilmDto]);

      await expect(service.create(createFilmDto)).rejects.toThrow(BadRequestException);
      expect(model.find).toHaveBeenCalledWith({title: createFilmDto.title})
    })
  })

  describe('Method FindAll', () => {
    it('deve retornar filmes filtrados, paginados e ordenados corretamente', async () => {
      const searchFilmsDto = { title: 'example', type: 'movie', genres: 'action', releaseYear: 2022 };
      const pagination = { page: 1, rows: 10, sortBy: 'title', sortOrder: 1 };
  
      // Configurar mocks
      const mockItems = [{ title: 'example movie' }];
      const mockTotalItems = 1;
      (model.find().exec as jest.Mock).mockResolvedValueOnce(mockItems);
      (model.countDocuments as jest.Mock).mockResolvedValueOnce(mockTotalItems);
  
      const result = await service.findAll(searchFilmsDto, pagination);
  
      // Verificar se o resultado corresponde aos mocks
      expect(result.items).toEqual(mockItems);
      expect(result.totalItems).toBe(mockTotalItems);
  
      // Verificar se os métodos foram chamados com os parâmetros corretos
      expect(model.find).toHaveBeenCalledWith(expect.objectContaining({
        title: { $regex: searchFilmsDto.title, $options: 'i' },
        type: { $regex: searchFilmsDto.type, $options: 'i' },
        genres: { $regex: searchFilmsDto.genres, $options: 'i' },
        releaseYear: searchFilmsDto.releaseYear,
      }));
      expect(queryMock.skip).toHaveBeenCalledWith((pagination.page - 1) * pagination.rows);
      expect(queryMock.limit).toHaveBeenCalledWith(pagination.rows);
      expect(queryMock.sort).toHaveBeenCalledWith({ [pagination.sortBy]: pagination.sortOrder });
    });
  })

  describe('Method FindOne', () => {
    const mockFilm = { _id: '1', title: 'example movie' };

    it('deve retornar um filme por ID', async () => {
      (model.findById as jest.Mock).mockResolvedValueOnce(mockFilm);

      const result = await service.findOne('1');

      expect(model.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockFilm);
    })

    it('deve lançar BadRequestException se não encontrar um filme com o ID fornecido', async () => {
      (model.findById as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.findOne('1')).rejects.toThrow(BadRequestException);
      expect(model.findById).toHaveBeenCalledWith('1');
    })
  })

  describe('Method Update', () => {
    const updateFilmDto: UpdateFilmDto = { title: 'updated example movie', type: 'Drama', genres: 'action', averageRating: '8.5', numVotes: 1000, releaseYear: 2022 };

    it('deve atualizar um filme por ID', async () => {
      (model.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce(updateFilmDto);

      const result = await service.update('1', updateFilmDto);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith('1', updateFilmDto, {new: true});
      expect(result).toEqual(updateFilmDto);
    })

    it('deve lançar BadRequestException se não encontrar um filme com o ID fornecido', async () => {
      (model.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.update('1', updateFilmDto)).rejects.toThrow(BadRequestException);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith('1', updateFilmDto, {new: true});
    })
  })

  describe('Method Remove', () => {
    it('deve remover um filme por ID', async () => {
      const mockFilm = { _id: '1', title: 'example movie' };
      (model.findByIdAndDelete as jest.Mock).mockResolvedValueOnce(mockFilm);

      const result = await service.remove('1');

      expect(model.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockFilm);
    })

    it('deve lançar BadRequestException se não encontrar um filme com o ID fornecido', async () => {
      (model.findByIdAndDelete as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.remove('1')).rejects.toThrow(BadRequestException);
      expect(model.findByIdAndDelete).toHaveBeenCalledWith('1');
    })
  })

});
