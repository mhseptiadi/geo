import { Test, TestingModule } from "@nestjs/testing";
import { GeoController } from "../controller/geo.controller";
import { GeoService } from "../service/geo.service";
import { BadRequestException, INestApplication } from "@nestjs/common";
import * as assert from "assert";
import { GeoJsonDto } from "../dto/geo-json.dto";
import { JwtModule } from "@nestjs/jwt";
import { vars } from "./vars";
import { UsersService } from "../service/user.service";
import { AuthService } from "../service/auth.service";
import { AuthController } from "../controller/auth.controller";

describe('AppController', () => {

  let app: INestApplication;
  let appController: GeoController;
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

    appController = moduleRef.get<GeoController>(GeoController);
    authController = moduleRef.get<AuthController>(AuthController);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  describe('unit test geo controller', () => {
    it('use valid json should ok', async () => {
      assert.deepEqual(
        await appController.geoJson(vars.correctGeoJson),
        {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [125.6, 10.1]
          },
          "properties": {
            "name": "Dinagat Islands"
          }
        } as GeoJsonDto
      );
    });

    it('use json file with invalid structure dto', async () => {
      await expect(appController.geoJson(vars.incorrectGeoJson))
        .rejects.toEqual(new BadRequestException(vars.invalidGeoDtoValidationResponse));
    });

    it('use json file with invalid content', async () => {
      await expect(appController.geoJson(vars.incorrectGeoJson2))
        .rejects.toEqual(new BadRequestException("Invalid Json file"));
    });
  });


  describe('unit test auth controller', () => {
    it('correct signin', async () => {
      const data = await authController.signIn(
        {
          "username": "test",
          "password": "test"
        }
      );
      assert.match(
        data.access_token,
        /[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-]+/gm,
      );
    });

    it('incorrect credential', async () => {
      await expect(authController.signIn(
        {
          "username": "test",
          "password": "wrong"
        }
      ))
        .rejects.toEqual(new BadRequestException("Unauthorized"));
    });
  });
});
