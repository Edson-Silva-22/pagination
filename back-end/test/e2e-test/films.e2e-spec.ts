import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { CreateFilmDto } from 'src/films/dto/create-film.dto';
import { UpdateFilmDto } from 'src/films/dto/update-film.dto';

describe('Filmes routes', () => {
  let app: INestApplication;
  let connection: Connection;
  const createFilmDto: CreateFilmDto = {
    title: 'new movie',
    type:'movie',
    genres: 'action, adventure',
    averageRating: '5.5',
    numVotes: 10000,
    releaseYear: 2022
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot('mongodb://localhost/best-films-tests'),
        AppModule
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    connection = moduleFixture.get<Connection>(getConnectionToken())
    await app.init();
  });

  beforeEach( async () => {
    // Limpa a coleção de usuários antes de cada teste, se necessário
    await connection.collection('films').deleteMany({});
  })

  describe('/films (POST)', () => {
    it('Deve realizar o cadastro de um novo filme com sucesso', async() => {
      const response = await request(app.getHttpServer())
       .post('/films')
       .send(createFilmDto)
       .expect(201)
      
      expect(response.body).toMatchObject(createFilmDto)
    })

    it('Deve retornar um erro 400 se os dados do filme forem inválidos', async () => {
      const invalidFilmDto = {
        title: '',
        type: '',
        genres: '',
        averageRating: '',
        numVotes: null,
        releaseYear: null
      }

      await request(app.getHttpServer())
       .post('/films')
       .send(invalidFilmDto)
       .expect(400)
    })
  })

  describe('/films (GET)', () => {
    it('Deve realizar a busca de todos os filmes', async () => {
      await request(app.getHttpServer())
       .post('/films')
       .send(createFilmDto)
       .expect(201)

      const response = await request(app.getHttpServer())
       .get('/films')
       .expect(200)
       
      expect(response.body.items).toEqual(
        expect.arrayContaining([expect.objectContaining(createFilmDto)])
      )
    })
  })

  describe('/films/:film_id', () => {
    it('Deve realizar a busca de um filme por ID', async () => {
      const createNewFilm = await request(app.getHttpServer())
       .post('/films')
       .send(createFilmDto)
       .expect(201)

      const filmId = createNewFilm.body._id

      const responseById = await request(app.getHttpServer())
       .get(`/films/${filmId}`)
       .expect(200)

      expect(responseById.body).toEqual(expect.objectContaining(createFilmDto))
    })

    it('Deve retornar um erro 404 se o filme não for encontrado', async () => {
      const nonexistentFilmId = '67164fc343b6f4bad3fbd047'

      await request(app.getHttpServer())
       .get(`/films/${nonexistentFilmId}`)
       .expect(400)
    })
  })
  
  describe('/films/:film_id (PUT)', () => {
    it('Deve realizar a atualização de um filme', async () => {
      const createNewFilm = await request(app.getHttpServer())
        .post('/films')
        .send(createFilmDto)
        .expect(201)

      const filmId = createNewFilm.body._id

      const updateFilmDto: UpdateFilmDto = {
        title: 'updated movie',
        type:'movie',
        genres: 'action, adventure, comedy',
        averageRating: '5.0',
        numVotes: 15000,
        releaseYear: 2021
      }

      const responseUpdate = await request(app.getHttpServer())
        .put(`/films/${filmId}`)
        .send(updateFilmDto)
        .expect(200)

      expect(responseUpdate.body).toEqual(expect.objectContaining(updateFilmDto))
    })

    it('Deve retornar um erro 400 se o filme não for encontrado', async () => {
      const nonexistentFilmId = '67164fc343b6f4bad3fbd047'

      await request(app.getHttpServer())
       .put(`/films/${nonexistentFilmId}`)
       .send({ title: 'updated movie' })
       .expect(400)
    })

  })

  describe('/films/:film_id (DELETE)', () => {
    it('Deve excluir um filme com sucesso', async () => {
      const createNewFilm = await request(app.getHttpServer())
        .post('/films')
        .send(createFilmDto)
        .expect(201)

      const filmId = createNewFilm.body._id

      await request(app.getHttpServer())
        .delete(`/films/${filmId}`)
        .expect(200)
    })

    it('Deve retornar um erro 400 se o filme não for encontrado', async () => {
      const nonexistentFilmId = '67164fc343b6f4bad3fbd047'

      await request(app.getHttpServer())
       .delete(`/films/${nonexistentFilmId}`)
       .expect(400)
    })
  })

  afterAll(async () => {
    await connection.close();
    await app.close();
  });

})