import { BadRequestException, Injectable } from "@nestjs/common";
import { GeoJsonDto } from '../dto/geo-json.dto';
import { plainToClass } from 'class-transformer';
import { validateSync } from "class-validator";
import * as fs from 'fs';

@Injectable()
export class GeoService {
  public async geoJson(file: Express.Multer.File): Promise<any> {
    let json: any;
    try {
      json = JSON.parse(file.buffer.toString())
    } catch (_) {
      throw new BadRequestException("Invalid Json file");
    }

    let geoJson: GeoJsonDto = plainToClass(GeoJsonDto, json)

    let validations: any[] = validateSync(geoJson);

    // console.log(JSON.stringify(validations))
    if (validations.length) {
      const errors: any[] = [];
      validations.forEach((elm) => {
        delete elm.target;
        errors.push(elm)
      });
      throw new BadRequestException(errors);
    }

    await fs.writeFileSync(
      './data/' + Math.floor(Date.now() / 1000) + '-' + file.originalname + '-data.json',
      file.buffer,
    );

    return { ...geoJson };
  }
}
