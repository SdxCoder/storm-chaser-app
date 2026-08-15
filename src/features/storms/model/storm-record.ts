import { type WeatherSnapshot } from '../../weather/model/weather-snapshot';
import { type StormType } from './storm-draft';

export type StormRecord = {
  id: string;
  photoUri: string;
  capturedAt: string;
  createdAt: string;
  updatedAt: string;
  latitude: number;
  longitude: number;
  locationAccuracyMetres: number | null;
  stormType: StormType;
  notes: string;
  observedConditions: string;
  weatherSnapshot: WeatherSnapshot | null;
};
