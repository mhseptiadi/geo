import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

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
  @IsNumber(null, {
    each: true,
  })
  @IsOptional()
  public coordinates: number[];
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
  // @IsOptional()
  @ValidateNested()
  @Type(() => GeoJsonDto)
  public geometry: geometryDto;

  @ApiProperty({
    description: 'Geo Json properties',
  })
  @IsOptional()
  public properties: any;
}
