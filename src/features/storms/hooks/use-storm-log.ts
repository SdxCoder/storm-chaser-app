import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { useDatabase } from '../../../services/database/database-provider';
import { listStormRecords } from '../data/storm-repository';
import { type StormRecord } from '../model/storm-record';

export type StormLogState =
  | { status: 'loading'; records: StormRecord[] }
  | { status: 'success'; records: StormRecord[] }
  | { status: 'error'; records: StormRecord[] };

export function useStormLog() {
  const database = useDatabase();
  const [state, setState] = useState<StormLogState>({ status: 'loading', records: [] });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const requestId = useRef(0);

  const reload = useCallback(
    async (refreshing = false) => {
      const currentRequestId = ++requestId.current;
      if (refreshing) {
        setIsRefreshing(true);
      } else {
        setState((current) => ({ status: 'loading', records: current.records }));
      }

      const result = await listStormRecords(database);
      if (currentRequestId !== requestId.current) {
        return;
      }

      setIsRefreshing(false);
      if (result.status === 'failure') {
        setState((current) => ({ status: 'error', records: current.records }));
        return;
      }

      setState({ status: 'success', records: result.data });
    },
    [database],
  );

  useFocusEffect(
    useCallback(() => {
      void reload();
      return () => {
        requestId.current += 1;
      };
    }, [reload]),
  );

  return {
    isRefreshing,
    refresh: () => void reload(true),
    reload: () => void reload(),
    state,
  };
}
