import { Test, TestingModule } from '@nestjs/testing';
import { GeoController } from '../src/controller/geo.controller';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as assert from 'assert';
import { vars } from '../src/test/vars';
import { UsersService } from '../src/service/user.service';
import { AuthService } from '../src/service/auth.service';
import { AuthController } from '../src/controller/auth.controller';
import { GeoServiceProvider } from '../src/provider/geo.service.provider';
import * as fs from 'fs';

describe('AppController', () => {
  let app: INestApplication;
  let geoController: GeoController;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: vars.moduleImports,
      controllers: [GeoController, AuthController],
      providers: [
        GeoServiceProvider(`data-test/e2e`),
        UsersService,
        AuthService,
      ],
    }).compile();

    geoController = moduleRef.get<GeoController>(GeoController);

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('E2E POST /geo', function () {
    it('upload correct file', function (done) {
      request(app.getHttpServer())
        .post('/geo')
        .set({ Authorization: `Bearer ${vars.adminToken}` })
        .attach('file', './data-test/test/sample.geojson.json')
        .expect(200)
        .end(function (err, res) {
          assert.deepEqual(res.body, {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [125.6, 10.1],
            },
            properties: {
              name: 'Dinagat Islands',
            },
          });
          return done();
        });
    });

    it('upload json file with invalid structure dto', function (done) {
      request(app.getHttpServer())
        .post('/geo')
        .set({ Authorization: `Bearer ${vars.adminToken}` })
        .attach('file', './data-test/test/invalid.geojson.json')
        .expect(400)
        .end(function (err, res) {
          assert.deepEqual(res.body, {
            message: vars.invalidGeoDtoValidationResponse,
            error: 'Bad Request',
            statusCode: 400,
          });
          return done();
        });
    });

    it('upload json file with invalid content', function (done) {
      request(app.getHttpServer())
        .post('/geo')
        .set({ Authorization: `Bearer ${vars.adminToken}` })
        .attach('file', './data-test/test/invalid.json')
        .expect(400)
        .end(function (err, res) {
          assert.deepEqual(res.body, {
            message: 'Invalid Json file',
            error: 'Bad Request',
            statusCode: 400,
          });
          return done();
        });
    });

    it('upload no file', function (done) {
      request(app.getHttpServer())
        .post('/geo')
        .set({ Authorization: `Bearer ${vars.adminToken}` })
        .expect(400)
        .end(function (err, res) {
          assert.deepEqual(res.body, {
            message: 'File is required',
            error: 'Bad Request',
            statusCode: 400,
          });
          return done();
        });
    });

    it('upload non json', function (done) {
      request(app.getHttpServer())
        .post('/geo')
        .set({ Authorization: `Bearer ${vars.adminToken}` })
        .attach('file', './data-test/test/me.jpg')
        .expect(400)
        .end(function (err, res) {
          assert.deepEqual(res.body, {
            message: 'Validation failed (expected type is application/json)',
            error: 'Bad Request',
            statusCode: 400,
          });
          return done();
        });
    });

    it('expired token', function (done) {
      request(app.getHttpServer())
        .post('/geo')
        .set({ Authorization: `Bearer ${vars.expiredToken}` })
        .expect(401)
        .end(function (err, res) {
          assert.deepEqual(res.body, {
            message: 'Invalid token',
            error: 'Unauthorized',
            statusCode: 401,
          });
          return done();
        });
    });

    it('invalid token', function (done) {
      request(app.getHttpServer())
        .post('/geo')
        .set({ Authorization: `Bearer ${vars.invalidToken}` })
        .expect(401)
        .end(function (err, res) {
          assert.deepEqual(res.body, {
            message: 'Invalid token',
            error: 'Unauthorized',
            statusCode: 401,
          });
          return done();
        });
    });

    it('processing geo json into db', async () => {
      for (const file of fs.readdirSync('./data-test/e2e/')) {
        if (fs.lstatSync(`./data-test/e2e/${file}`).isFile()) {
          await fs.unlink(`./data-test/e2e/${file}`, () => {});
        }
      }

      for (const file of fs.readdirSync('./data-test/test/')) {
        fs.copyFileSync(`./data-test/test/${file}`, `./data-test/e2e/${file}`);
      }

      request(app.getHttpServer())
        .post('/geo/process')
        .set({ Authorization: `Bearer ${vars.adminToken}` })
        .expect(200)
        .end(function (err, res) {
          assert.deepEqual(res.body, {
            invalid: ['invalid.geojson.json', 'invalid.json', 'me.jpg'],
            processed: ['sample.geojson.json'],
          });
        });
    });

    it('processing geo json using user token', async () => {
      request(app.getHttpServer())
        .post('/geo/process')
        .set({ Authorization: `Bearer ${vars.userToken}` })
        .expect(200)
        .end(function (err, res) {
          assert.deepEqual(res.body, {
            message: 'Invalid roles',
            error: 'Unauthorized',
            statusCode: 401,
          });
        });
    });
  });
});
