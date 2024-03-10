import { Module } from '@nestjs/common';
import { GeoController } from './controller/geo.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from './service/user.service';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { GeoSchema, GeoSchemaName } from './schema/geo.schema';
import { GeoServiceProvider } from './provider/geo.service.provider';
import { environment } from './environment/environment';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: environment.jwtSecret,
      signOptions: { expiresIn: environment.jwtExp },
    }),
    MongooseModule.forRoot(environment.mongodb, {
      dbName: environment.dbName,
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
    GeoServiceProvider(environment.uploadPath),
    UsersService,
    AuthService,
  ],
})
export class AppModule {}
