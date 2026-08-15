import { type StormType } from './storm-draft';

const stormTypeLabels: Record<StormType, string> = {
  thunderstorm: 'Thunderstorm',
  tornado: 'Tornado',
  hail: 'Hail',
  'heavy-rain': 'Heavy rain',
  'high-wind': 'High wind',
  snowstorm: 'Snowstorm',
  other: 'Other',
};

export function stormTypeLabel(stormType: StormType): string {
  return stormTypeLabels[stormType];
}
