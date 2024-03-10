import { Module } from '@nestjs/common';
import { GeoController } from './controller/geo.controller';
import { GeoService } from './service/geo.service';
import { JwtModule } from "@nestjs/jwt";
import { UsersService } from "./service/user.service";
import { AuthService } from "./service/auth.service";
import { AuthController } from "./controller/auth.controller";

@Module({
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
})
export class AppModule {}
