import {
  Controller,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GeoService } from '../service/geo.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '../guard/auth.guard';
import { Roles } from '../decorator/role.decorator';

@Controller('geo')
export class GeoController {
  constructor(private readonly appService: GeoService) {}

  @UseGuards(AuthGuard)
  @Roles('user')
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  public async geoJson(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'application/json' })],
      }),
    )
    file: Express.Multer.File,
  ): Promise<any> {
    return this.appService.geoJson(file);
  }

  @UseGuards(AuthGuard)
  @Roles('admin')
  @Post('process')
  @HttpCode(HttpStatus.OK)
  public async process(): Promise<any> {
    return this.appService.process();
  }
}
