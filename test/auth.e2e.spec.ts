import { Test, TestingModule } from "@nestjs/testing";
import { GeoController } from "../src/controller/geo.controller";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import * as assert from "assert";
import { vars } from "../src/test/vars";
import { UsersService } from "../src/service/user.service";
import { AuthService } from "../src/service/auth.service";
import { AuthController } from "../src/controller/auth.controller";
import { GeoServiceProvider } from "../src/provider/geo.service.provider";
import * as fs from 'fs';

describe('AppController', () => {
  let app: INestApplication;
  let authController: AuthController;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: vars.moduleImports,
      controllers: [GeoController, AuthController],
      providers: [GeoServiceProvider(`data-test/e2e`), UsersService, AuthService],
    }).compile();

    authController = moduleRef.get<AuthController>(AuthController);

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('E2E POST /auth', function () {
    it('login correct', function (done) {
      request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'test',
          password: 'test',
        })
        .expect(200)
        .end(function (err, res) {
          assert.match(
            res.body.access_token,
            /[a-zA-Z0-9\-\_]+\.[a-zA-Z0-9\-\_]+\.[a-zA-Z0-9\-\_]+/gm,
          );
          return done();
        });
    });

    it('login incorrect password', function (done) {
      request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'test',
          password: 'test2',
        })
        .expect(401)
        .end(function (err, res) {
          assert.deepEqual(res.body, {
            message: 'Unauthorized',
            statusCode: 401,
          });
          return done();
        });
    });

    it('login incorrect payload structure', function (done) {
      request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400)
        .end(function (err, res) {
          assert.deepEqual(res.body, {
            message: ['username must be a string', 'password must be a string'],
            error: 'Bad Request',
            statusCode: 400,
          });
          return done();
        });
    });

    it('using admin profile', function (done) {
      request(app.getHttpServer())
        .get('/auth/profile')
        .set({ Authorization: `Bearer ${vars.adminToken}` })
        .expect(200)
        .end(function (err, res) {
          assert.deepEqual(res.body.username, 'admin');
          return done();
        });
    });

    it('using user profile', function (done) {
      request(app.getHttpServer())
        .get('/auth/profile')
        .set({ Authorization: `Bearer ${vars.userToken}` })
        .expect(200)
        .end(function (err, res) {
          assert.deepEqual(res.body.username, 'user');
          return done();
        });
    });
  });
});
