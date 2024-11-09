import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { FilmsService } from './films.service';
import { Model } from 'mongoose';
import { Film } from './schemas/films';

describe('FilmService - findAll', () => {
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
            find: jest.fn().mockReturnThis(),
            
            countDocuments: jest.fn(),
            
          },
        },
      ],
    }).compile();

    service = module.get<FilmsService>(FilmsService);
    model = module.get<Model<Film>>(getModelToken(Film.name));

    (model.find as jest.Mock).mockReturnValue(queryMock);
  });

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
});
