import { GeoService } from "../service/geo.service";
import { Model } from "mongoose";
import { GeoModel } from "../model/geo.model";
import { getModelToken } from "@nestjs/mongoose";
import { GeoSchemaName } from "../schema/geo.schema";

export const GeoServiceProvider: any = (dataPath: string) => {
  return {
    inject: [getModelToken(GeoSchemaName)],
    provide: GeoService,
    useFactory: (geoModel: Model<GeoModel>) => {
      return new GeoService(geoModel, dataPath);
    },
  };
};
