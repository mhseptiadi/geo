import { Test, TestingModule } from '@nestjs/testing';
import { GeoController } from '../controller/geo.controller';
import { BadRequestException, INestApplication } from '@nestjs/common';
import * as assert from 'assert';
import { GeoJsonDto } from '../dto/geo-json.dto';
import { vars } from './vars';
import { UsersService } from '../service/user.service';
import { AuthService } from '../service/auth.service';
import { AuthController } from '../controller/auth.controller';
import { GeoServiceProvider } from '../provider/geo.service.provider';
import * as fs from 'fs';

describe('AppController', () => {
  let app: INestApplication;
  let geoController: GeoController;
  let authController: AuthController;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: vars.moduleImports,
      controllers: [GeoController, AuthController],
      providers: [GeoServiceProvider(`data-test/unit-controller`), UsersService, AuthService],
    }).compile();

    geoController = moduleRef.get<GeoController>(GeoController);
    authController = moduleRef.get<AuthController>(AuthController);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  describe('unit test geo controller', () => {
    it('use valid json should ok', async () => {
      assert.deepEqual(await geoController.geoJson(vars.correctGeoJson), {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [125.6, 10.1],
        },
        properties: {
          name: 'Dinagat Islands',
        },
      } as GeoJsonDto);
    });

    it('use json file with invalid structure dto', async () => {
      await expect(
        geoController.geoJson(vars.incorrectGeoJson),
      ).rejects.toEqual(
        new BadRequestException(vars.invalidGeoDtoValidationResponse),
      );
    });

    it('use json file with invalid content', async () => {
      await expect(
        geoController.geoJson(vars.incorrectGeoJson2),
      ).rejects.toEqual(new BadRequestException('Invalid Json file'));
    });

    it('processing geo json into db', async () => {
      for (const file of fs.readdirSync('./data-test/unit-controller/')) {
        if (fs.lstatSync(`./data-test/unit-controller/${file}`).isFile()) {
          await fs.unlink(`./data-test/unit-controller/${file}`, () => {});
        }
      }

      for (const file of fs.readdirSync('./data-test/test/')) {
        fs.copyFileSync(`./data-test/test/${file}`, `./data-test/unit-controller/${file}`);
      }

      assert.deepEqual(await geoController.process(), {
        invalid: ['invalid.geojson.json', 'invalid.json', 'me.jpg'],
        processed: ['sample.geojson.json'],
      });
    });
  });

  describe('unit test auth controller', () => {
    it('correct signin', async () => {
      const data = await authController.signIn({
        username: 'test',
        password: 'test',
      });
      assert.match(
        data.access_token,
        /[a-zA-Z0-9\-\_]+\.[a-zA-Z0-9\-\_]+\.[a-zA-Z0-9\-\_]+/gm,
      );
    });

    it('incorrect credential', async () => {
      await expect(
        authController.signIn({
          username: 'test',
          password: 'wrong',
        }),
      ).rejects.toEqual(new BadRequestException('Unauthorized'));
    });
  });
});
