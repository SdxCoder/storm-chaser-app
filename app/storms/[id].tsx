import { useLocalSearchParams } from 'expo-router';

import { StormDetailScreen } from '../../src/features/storms/screens/storm-detail-screen';

export default function StormDetailRoute() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const recordId = typeof id === 'string' ? id : null;

  return <StormDetailScreen recordId={recordId} />;
}
