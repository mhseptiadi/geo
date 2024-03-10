import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class geometryDto {
  @ApiProperty({
    description: 'Geo Json Geometry Type',
  })
  @IsString()
  @IsOptional()
  public type: string;

  @ApiProperty({
    description: 'Geo Json Geometry Coordinates',
  })
  @IsOptional()
  public coordinates: any[];
}

export class GeoJsonDto {
  @ApiProperty({
    description: 'Geo Json Type',
  })
  @IsString()
  @IsOptional()
  public type: string;

  @ApiProperty({
    description: 'Geo Json geometry',
  })
  @ValidateNested()
  @Type(() => GeoJsonDto)
  public geometry: geometryDto;

  @ApiProperty({
    description: 'Geo Json properties',
  })
  @IsOptional()
  public properties: any;
}
