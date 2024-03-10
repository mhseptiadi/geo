import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'username',
  })
  @IsString()
  public username: string;

  @ApiProperty({
    description: 'password',
  })
  @IsString()
  public password: string;
}
