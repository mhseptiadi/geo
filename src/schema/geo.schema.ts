// structure geojson: https://geojson.org/

import { Schema } from 'mongoose';
import { v4 as uuid } from 'uuid';

const geometrySchema: Schema = new Schema({
  type: { type: Schema.Types.String },
  coordinates: [{ type: Schema.Types.Mixed }],
});

export const GeoSchemaName: string = 'Geo';
export const GeoSchema: Schema = new Schema(
  {
    _id: { type: Schema.Types.String, default: uuid },
    type: { type: Schema.Types.String },
    geometry: { type: geometrySchema },
    properties: { type: Schema.Types.Mixed },
  },
  {
    minimize: false,
    timestamps: {},
    toJSON: { virtuals: true },
  },
);
