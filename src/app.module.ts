import { Module } from "@nestjs/common";
import { GeoController } from "./controller/geo.controller";
import { JwtModule } from "@nestjs/jwt";
import { UsersService } from "./service/user.service";
import { AuthService } from "./service/auth.service";
import { AuthController } from "./controller/auth.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { GeoSchema, GeoSchemaName } from "./schema/geo.schema";
import { GeoServiceProvider } from "./provider/geo.service.provider";

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: 'mysecret',
      signOptions: { expiresIn: '3600s' },
    }),
    MongooseModule.forRoot('mongodb://127.0.0.1:27017', {
      dbName: 'geo',
    }),
    MongooseModule.forFeature([
      {
        name: GeoSchemaName,
        schema: GeoSchema,
      },
    ]),
  ],
  controllers: [GeoController, AuthController],
  providers: [
    GeoServiceProvider('data'),
    UsersService,
    AuthService,
  ],
})
export class AppModule {}
