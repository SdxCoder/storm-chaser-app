import { useEffect, useRef, useState } from 'react';

import { useDatabase } from '../../../services/database/database-provider';
import { getStormRecordById } from '../data/storm-repository';
import { type StormRecord } from '../model/storm-record';

export type StormDetailState =
  | { status: 'invalid-id' }
  | { status: 'loading' }
  | { status: 'not-found' }
  | { status: 'error' }
  | { status: 'success'; record: StormRecord };

export function isValidStormRecordId(recordId: string | null): recordId is string {
  return recordId !== null && /^storm-[a-z0-9]+-[a-z0-9]+$/.test(recordId);
}

export function useStormDetail(recordId: string | null) {
  const database = useDatabase();
  const [retryCount, setRetryCount] = useState(0);
  const [state, setState] = useState<StormDetailState>(
    isValidStormRecordId(recordId) ? { status: 'loading' } : { status: 'invalid-id' },
  );
  const requestId = useRef(0);

  useEffect(() => {
    const currentRequestId = ++requestId.current;
    if (!isValidStormRecordId(recordId)) {
      setState({ status: 'invalid-id' });
      return;
    }

    setState({ status: 'loading' });
    void getStormRecordById(database, recordId)
      .then((result) => {
        if (currentRequestId !== requestId.current) {
          return;
        }
        if (result.status === 'failure') {
          setState({ status: 'error' });
        } else if (result.data === null) {
          setState({ status: 'not-found' });
        } else {
          setState({ status: 'success', record: result.data });
        }
      })
      .catch(() => {
        if (currentRequestId === requestId.current) {
          setState({ status: 'error' });
        }
      });

    return () => {
      requestId.current += 1;
    };
  }, [database, recordId, retryCount]);

  return { retry: () => setRetryCount((current) => current + 1), state };
}
