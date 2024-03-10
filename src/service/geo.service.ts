import { BadRequestException, Injectable } from '@nestjs/common';
import { GeoJsonDto } from '../dto/geo-json.dto';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import * as fs from 'fs';
import { GeoSchemaName } from '../schema/geo.schema';
import { GeoModel } from '../model/geo.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class GeoService {
  constructor(
    @InjectModel(GeoSchemaName) private readonly geoModel: Model<GeoModel>,
    private readonly dataPath: string,
  ) {}

  public async geoJson(file: Express.Multer.File): Promise<any> {
    let json: any;
    try {
      json = JSON.parse(file.buffer.toString());
    } catch (_) {
      throw new BadRequestException('Invalid Json file');
    }

    const geoJson: GeoJsonDto = plainToClass(GeoJsonDto, json);

    const validations: any[] = validateSync(geoJson);

    if (validations.length) {
      const errors: any[] = [];
      validations.forEach((elm) => {
        delete elm.target;
        errors.push(elm);
      });
      throw new BadRequestException(errors);
    }

    await fs.writeFileSync(
      `./${this.dataPath}/` +
        Math.floor(Date.now() / 1000) +
        '-' +
        file.originalname +
        '-data.json',
      file.buffer,
    );

    return { ...geoJson };
  }

  public async test(): Promise<string> {
    return 'ok';
  }

  public async process(): Promise<any> {
    const processed: string[] = [];
    const invalid: string[] = [];

    for (const file of fs.readdirSync(`./${this.dataPath}/`)) {
      if (fs.lstatSync(`./${this.dataPath}/${file}`).isFile()) {
        try {
          const json: string = fs.readFileSync(`./${this.dataPath}/${file}`, {
            encoding: 'utf8',
          });
          const geoJson: GeoJsonDto = plainToClass(GeoJsonDto, JSON.parse(json));
          const validations: any[] = validateSync(geoJson);
          if (validations.length == 0) {
            // processing
            processed.push(file);
            await this.geoModel.create(geoJson);
            fs.rename(
              `./${this.dataPath}/${file}`,
              `./${this.dataPath}/processed/${file}`,
              function (err: any) {
                if (err) throw err;
              },
            );
          } else {
            // invalid file, move to invalid folder
            invalid.push(file);
            fs.rename(
              `./${this.dataPath}/${file}`,
              `./${this.dataPath}/invalid/${file}`,
              function (err: any) {
                if (err) throw err;
              },
            );
          }
        } catch (e) {
          // invalid file, move to invalid folder
          invalid.push(file);
          fs.rename(
            `./${this.dataPath}/${file}`,
            `./${this.dataPath}/invalid/${file}`,
            function (err: any) {
              if (err) throw err;
            },
          );
        }
      }
    }

    return {
      processed,
      invalid,
    };
  }
}
