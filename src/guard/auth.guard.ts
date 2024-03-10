import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    protected readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    const rolesReflection: string[] = this.extractRolesFromDecorator(context);

    if (!token) {
      throw new UnauthorizedException(`No token`);
    }

    let payload: any;

    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: 'mysecret',
      });

      request['user'] = payload;
    } catch {
      throw new UnauthorizedException(`Invalid token`);
    }

    if (rolesReflection.length > 0) {
      const intersect: string[] = rolesReflection.filter((value: string) =>
        payload.roles.includes(value),
      );
      if (intersect.length == 0) {
        throw new UnauthorizedException(`Invalid roles`);
      }
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractRolesFromDecorator(context: ExecutionContext): string[] {
    const roles: string[] = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!roles) {
      return this.reflector.get<string[]>('roles', context.getClass());
    }

    return roles;
  }
}
