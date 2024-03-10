import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './user.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    username: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findOne(username);

    if (!user || user?.password !== pass) {
      throw new UnauthorizedException();
    }

    const payload = { username: user.username, roles: user.roles };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}