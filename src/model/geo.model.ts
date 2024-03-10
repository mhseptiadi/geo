import { Document } from 'mongoose';

interface geometryInterface {
  type: string;
  coordinates: any[];
}

export interface GeoInterface {
  type: string;
  geometry: geometryInterface;
  properties: any;
}

export interface GeoModel extends GeoInterface, Document {}
