import { Test, TestingModule } from "@nestjs/testing";
import { GeoService } from "../service/geo.service";
import { BadRequestException, INestApplication } from "@nestjs/common";
import * as assert from "assert";
import { GeoJsonDto } from "../dto/geo-json.dto";
import { vars } from "./vars";
import { UsersService } from "../service/user.service";
import { AuthService } from "../service/auth.service";
import { JwtModule } from "@nestjs/jwt";

describe('AppController', () => {

  let app: INestApplication;
  let geoService: GeoService;
  let usersService: UsersService;
  let authService: AuthService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          global: true,
          secret: 'mysecret',
          signOptions: { expiresIn: '3600s' },
        }),
      ],
      providers: [
        GeoService,
        UsersService,
        AuthService,
      ],
    }).compile();

    geoService = moduleRef.get<GeoService>(GeoService);
    usersService = moduleRef.get<UsersService>(UsersService);
    authService = moduleRef.get<AuthService>(AuthService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  describe('unit test geo service', () => {
    it('use valid json should ok', async () => {
      assert.deepEqual(
        await geoService.geoJson(vars.correctGeoJson),
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
      await expect(geoService.geoJson(vars.incorrectGeoJson))
        .rejects.toEqual(new BadRequestException(vars.invalidGeoDtoValidationResponse));
    });

    it('use json file with invalid content', async () => {
      await expect(geoService.geoJson(vars.incorrectGeoJson2))
        .rejects.toEqual(new BadRequestException("Invalid Json file"));
    });
  });

  describe('unit test user service', () => {
    it('find user', async () => {
      assert.deepEqual(
        await usersService.findOne('test'),
        {
          username: 'test',
          password: 'test',
          roles: [
            'user',
          ]
        }
      );
    });

    it('user not exist', async () => {
      assert.deepEqual(
        await usersService.findOne('not me'),
        undefined
      );
    });
  });

  describe('unit test auth service', () => {
    it('correct signin', async () => {
      const data = await authService.signIn('test', 'test');
      assert.match(
        data.access_token,
        /[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-]+/gm,
      );
    });


    it('incorrect signin', async () => {
      await expect(authService.signIn('test', '1234'))
        .rejects.toEqual(new BadRequestException("Unauthorized"));
    });
  });
});
