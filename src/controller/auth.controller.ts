import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../guard/auth.guard";
import { AuthService } from "../service/auth.service";
import { Roles } from "../decorator/role.decorator";
import { ApiBody } from "@nestjs/swagger";
import { LoginDto } from "../dto/login.dto";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  @Post('login')
  signIn(@Body() signInDto: LoginDto) {
      return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @UseGuards(AuthGuard)
  @Roles('user', 'admin')
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}