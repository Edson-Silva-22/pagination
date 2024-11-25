import { Test, TestingModule } from '@nestjs/testing';
import { FilmsController } from '../films.controller';
import { FilmsService } from '../films.service';
import { CreateFilmDto } from '../dto/create-film.dto';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

describe('FilmsController', () => {
  let controller: FilmsController;
  let service: FilmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmsController],
      providers: [
        {
          provide: FilmsService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn()
          }
        }
      ],
    }).compile();

    controller = module.get<FilmsController>(FilmsController);
    service = module.get<FilmsService>(FilmsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Método Create', () => {
    it('deve salvar um novo filme no banco de dados', async () => {
      const createFilmDto: CreateFilmDto = { 
        title: 'example movie', 
        type: 'movie', 
        releaseYear: 2022, 
        genres: 'action, adventure', 
        averageRating: '5.5',
        numVotes: 10000
      };

      (service.create as jest.Mock).mockResolvedValue(createFilmDto);

      const result = await controller.create(createFilmDto);

      expect(result).toBe(createFilmDto)
      expect(service.create).toHaveBeenCalledWith(createFilmDto)
    })

    it('deve lançar mensagens de erro se os campos necessários não forem informados', async () => {
      //simulando body vazio
      const invalidFilmDto = { };
    
      const pipe = new ValidationPipe({ whitelist: true, transform: true });
      const dtoInstance = plainToInstance(CreateFilmDto, invalidFilmDto);
    
      try {
        await pipe.transform(dtoInstance, { type: 'body', metatype: CreateFilmDto });
      } catch (error) {
        // Aqui pode-se acessar os detalhes do erro, incluindo as mensagens de validação retornados pelo class-validation
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response.message).toEqual(
          //O método arrayContaining do Jest verifica se o array fornecido contém os valores esperados, independentemente da ordem ou se há outros valores além dos esperados.
          expect.arrayContaining([
            'O título do filme deve ser informado.',
            'O título do filme deve ser uma string.',
            "O tipo do filme deve ser informado.",
            "O tipo do filme deve ser uma string.",
            "Os gêneros do filme devem ser informados.",
            "Os gêneros do filme devem ser uma string.",
            "A média de rating do filme deve ser informada.",
            "A média de rating do filme deve ser uma string.",
            "O número de votos do filme deve ser informado.",
            "O número de votos do filme deve ser um número.",
            "Ano de lançamento do filme deve ser informado.",
            "Ano de lançamento do filme deve ser um número."
          ])
        )
      }

    });
    
  })

  describe('Método FindAll', () => {
    it('deve retornar filmes filtrados, paginados e ordenados corretamente', async () => {
      const searchFilmsDto = { title: 'example', type: 'movie', genres: 'action', releaseYear: 2022 };
      const pagination = { page: 1, rows: 10, sortBy: 'title', sortOrder: 1 };
      const mockResult = {
        items: [{ title: 'example movie' }],
        totalItems: 1,
        page: 1,
        rows: 10
      };

      (service.findAll as jest.Mock).mockResolvedValue({items: mockResult.items, totalItems: mockResult.totalItems});

      const result = await controller.findAll(pagination, searchFilmsDto);

      expect(result.items).toBe(mockResult.items)
      expect(result.totalItems).toBe(mockResult.totalItems)
      expect(result.page).toBe(mockResult.page)
      expect(result.rows).toBe(mockResult.rows)
      expect(service.findAll).toHaveBeenCalledWith(searchFilmsDto, pagination)
    })
  })

  describe('Método FindOne', () => {
    it('deve retornar um filme por ID', async () => {
      const mockFilm = { _id: '1', title: 'example movie' };
      (service.findOne as jest.Mock).mockResolvedValue(mockFilm);

      const result = await controller.findOne('1');

      expect(result).toBe(mockFilm)
      expect(service.findOne).toHaveBeenCalledWith('1')
    })
  })

  describe('Método Update', () => {
    it('deve atualizar um filme por ID', async () => {
      const updateFilmDto = { title: 'updated movie' };
      const mockFilm = { _id: '1', title: 'example movie' };

      (service.update as jest.Mock).mockResolvedValue(mockFilm);

      const result = await controller.update('1', updateFilmDto);

      expect(result).toBe(mockFilm)
      expect(service.update).toHaveBeenCalledWith('1', updateFilmDto)
    })
  })

  describe('Método Remove', () => {
    it('deve remover um filme por ID', async () => {
      const mockFilm = { _id: '1', title: 'example movie' };
      (service.remove as jest.Mock).mockResolvedValue(mockFilm);

      const result = await controller.remove('1');

      expect(result).toBe(mockFilm)
      expect(service.remove).toHaveBeenCalledWith('1')
    })
  })
});
