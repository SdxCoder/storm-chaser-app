import { useCallback, useRef, useState } from 'react';

import { useDatabase } from '../../../services/database/database-provider';
import { type StormDraft } from '../model/storm-draft';
import { type StormRecord } from '../model/storm-record';
import { saveStormDraft, type SaveStormDraftResult } from '../services/save-storm-draft';

export type SaveStormState =
  | { status: 'idle' }
  | { status: 'saving' }
  | { status: 'success'; record: StormRecord }
  | {
      status: 'error';
      reason: Extract<SaveStormDraftResult, { status: 'failure' }>['reason'];
      cleanupFailed: boolean;
    };

export function useSaveStorm() {
  const database = useDatabase();
  const [state, setState] = useState<SaveStormState>({ status: 'idle' });
  const saveInProgress = useRef(false);

  const save = useCallback(
    async (draft: StormDraft): Promise<StormRecord | null> => {
      if (saveInProgress.current) {
        return null;
      }

      saveInProgress.current = true;
      setState({ status: 'saving' });

      try {
        const result = await saveStormDraft(database, draft);
        if (result.status === 'failure') {
          setState({
            status: 'error',
            reason: result.reason,
            cleanupFailed: result.cleanupFailed ?? false,
          });
          return null;
        }

        setState({ status: 'success', record: result.record });
        return result.record;
      } catch {
        setState({ status: 'error', reason: 'database', cleanupFailed: false });
        return null;
      } finally {
        saveInProgress.current = false;
      }
    },
    [database],
  );

  return { save, state };
}
