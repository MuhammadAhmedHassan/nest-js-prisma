import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';
import { randomBytes } from 'crypto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    await app.listen(3333);
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });
  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'email@email.com',
      password: 'Test@123',
    };
    describe('signup', () => {
      it('should throw error if email is not provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ password: 'Test@123' })
          .expectStatus(400);
      });
      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201)
          .inspect();
      });
    });
    describe('signin', () => {
      it('should signin', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAccessToken', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get current user', () => {
      it('Should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}', // this syntax is used by pactum
          })
          .expectStatus(200)
          .inspect();
      });
    });
    describe('Edit user', () => {
      const dto: EditUserDto = {
        firstName: 'Email',
      };
      it('Should edit user', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}', // this syntax is used by pactum
          })
          .withBody(dto)
          .expectStatus(200)
          .inspect()
          .expectBodyContains(dto.firstName);
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Get empty bookmark list', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}', // this syntax is used by pactum
          })
          .expectStatus(200)
          .inspect()
          .expectBody([]);
      });
    });
    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        link: randomBytes(12).toString('ascii'),
        title: randomBytes(12).toString('ascii'),
        description: randomBytes(12).toString('ascii'),
      };
      it('should create a bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}', // this syntax is used by pactum
          })
          .withBody(dto)
          .expectStatus(201)
          .inspect()
          .stores('bookmarkId', 'id');
      });
    });
    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}', // this syntax is used by pactum
          })
          .expectStatus(200)
          .inspect()
          .expectJsonLength(1);
      });
    });
    describe('Get bookmark by id', () => {
      it('should get a bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}', // this syntax is used by pactum
          })
          .expectStatus(200)
          .inspect()
          .expectJsonLength(1);
      });
    });
    describe('Edit bookmark', () => {
      const dto: EditBookmarkDto = {
        title: randomBytes(12).toString('ascii'),
      };
      it('should edit a bookmark by id', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}', // this syntax is used by pactum
          })
          .withBody(dto)
          .expectStatus(200)
          .inspect();
      });
    });
    describe('Delete bookmark', () => {
      it('should delete a bookmark by id', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}', // this syntax is used by pactum
          })
          .expectStatus(204)
          .inspect();
      });
    });
  });
});

// describe('AppController (e2e)', () => {
//   let app: INestApplication;

//   beforeEach(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [AppModule],
//     }).compile();

//     app = moduleFixture.createNestApplication();
//     await app.init();
//   });

//   it('/ (GET)', () => {
//     return request(app.getHttpServer())
//       .get('/')
//       .expect(200)
//       .expect('Hello World!');
//   });
// });
