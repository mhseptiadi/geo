import { Test, TestingModule } from "@nestjs/testing";
import { GeoController } from "../controller/geo.controller";
import { GeoService } from "../service/geo.service";
import { BadRequestException, INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import * as assert from "assert";
import { JwtModule } from "@nestjs/jwt";
import { vars } from "./vars";
import { UsersService } from "../service/user.service";
import { AuthService } from "../service/auth.service";
import { AuthController } from "../controller/auth.controller";

describe('AppController', () => {

  let app: INestApplication;
  let geoController: GeoController;
  let authController: AuthController;


  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          global: true,
          secret: 'mysecret',
          signOptions: { expiresIn: '3600s' },
        }),
      ],
      controllers: [
        GeoController,
        AuthController,
      ],
      providers: [
        GeoService,
        UsersService,
        AuthService,
      ],
    }).compile();

    geoController = moduleRef.get<GeoController>(GeoController);
    authController = moduleRef.get<AuthController>(AuthController);

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('E2E POST /geo', function() {
    it('send correct file', function(done) {
      request(app.getHttpServer())
        .post('/geo')
        .set({ Authorization: `Bearer ${vars.adminToken}` })
        .attach('file', './data/sample.geojson.json')
        .expect(200)
        .end(function(err, res) {
          assert.deepEqual(
            res.body,
            {
              "type": "Feature",
              "geometry": {
                "type": "Point",
                "coordinates": [
                  125.6,
                  10.1
                ]
              },
              "properties": {
                "name": "Dinagat Islands"
              }
            },
          )
          return done();
        });
    });

    it('send json file with invalid structure dto', function(done) {
      request(app.getHttpServer())
        .post('/geo')
        .set({ Authorization: `Bearer ${vars.adminToken}` })
        .attach('file', './data/invalid.geojson.json')
        .expect(400)
        .end(function(err, res) {
          assert.deepEqual(
            res.body,
            {
              message: vars.invalidGeoDtoValidationResponse,
              error: 'Bad Request',
              statusCode: 400,
            })
          return done();
        });
    });

    it('send json file with invalid content', function(done) {
      request(app.getHttpServer())
        .post('/geo')
        .set({ Authorization: `Bearer ${vars.adminToken}` })
        .attach('file', './data/invalid.json')
        .expect(400)
        .end(function(err, res) {
          assert.deepEqual(res.body, { message: 'Invalid Json file', error: 'Bad Request', statusCode: 400 })
          return done();
        });
    });

    it('send no file', function(done) {
      request(app.getHttpServer())
        .post('/geo')
        .set({ Authorization: `Bearer ${vars.adminToken}` })
        .expect(400)
        .end(function(err, res) {
          assert.deepEqual(res.body, { message: 'File is required', error: 'Bad Request', statusCode: 400 })
          return done();
        });
    });

    it('send non json', function(done) {
      request(app.getHttpServer())
        .post('/geo')
        .set({ Authorization: `Bearer ${vars.adminToken}` })
        .attach('file', './data/me.jpg')
        .expect(400)
        .end(function(err, res) {
          assert.deepEqual(
            res.body,
            {
              message: 'Validation failed (expected type is application/json)',
              error: 'Bad Request',
              statusCode: 400,
            },
          )
          return done();
        });
    });

    it('invalid roles', function(done) {
      request(app.getHttpServer())
        .post('/geo')
        .set({ Authorization: `Bearer ${vars.userToken}` })
        .expect(401)
        .end(function(err, res) {
          assert.deepEqual(
            res.body,
            {
              message: "Invalid roles",
              error: "Unauthorized",
              statusCode: 401,
            },
          )
          return done();
        });
    });

    it('expired token', function(done) {
      request(app.getHttpServer())
        .post('/geo')
        .set({ Authorization: `Bearer ${vars.expiredToken}` })
        .expect(401)
        .end(function(err, res) {
          assert.deepEqual(
            res.body,
            {
              message: "Invalid token",
              error: "Unauthorized",
              statusCode: 401,
            },
          )
          return done();
        });
    });

    it('invalid token', function(done) {
      request(app.getHttpServer())
        .post('/geo')
        .set({ Authorization: `Bearer ${vars.invalidToken}` })
        .expect(401)
        .end(function(err, res) {
          assert.deepEqual(
            res.body,
            {
              message: "Invalid token",
              error: "Unauthorized",
              statusCode: 401,
            },
          )
          return done();
        });
    });

  });

  describe('E2E POST /auth', function() {
    it('login correct', function(done) {
      request(app.getHttpServer())
        .post('/auth/login')
        .send({
          "username": "test",
          "password": "test"
        })
        .expect(200)
        .end(function(err, res) {
          assert.match(
            res.body.access_token,
            /[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-]+/gm,
          );
          return done();
        });
    });

    it('login incorrect password', function(done) {
      request(app.getHttpServer())
        .post('/auth/login')
        .send({
          "username": "test",
          "password": "test2"
        })
        .expect(401)
        .end(function(err, res) {
          assert.deepEqual(
            res.body,
            {
              message: "Unauthorized",
              statusCode: 401,
            },
          )
          return done();
        });
    });

    it('login incorrect payload structure', function(done) {
      request(app.getHttpServer())
        .post('/auth/login')
        .send({
        })
        .expect(400)
        .end(function(err, res) {
          assert.deepEqual(
            res.body,
            {
              "message": [
                "username must be a string",
                "password must be a string"
              ],
              "error": "Bad Request",
              "statusCode": 400
            },
          )
          return done();
        });
    });

    it('admin profile', function(done) {
      request(app.getHttpServer())
        .get('/auth/profile')
        .set({ Authorization: `Bearer ${vars.adminToken}` })
        .expect(200)
        .end(function(err, res) {
          assert.deepEqual(res.body.username, 'admin')
          return done();
        });
    });

    it('user profile', function(done) {
      request(app.getHttpServer())
        .get('/auth/profile')
        .set({ Authorization: `Bearer ${vars.userToken}` })
        .expect(200)
        .end(function(err, res) {
          assert.deepEqual(res.body.username, 'user')
          return done();
        });
    });
  });
});
