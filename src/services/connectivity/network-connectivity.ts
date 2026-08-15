import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

type RelevantNetworkState = Pick<NetInfoState, 'isConnected' | 'isInternetReachable'>;

export function isNetworkStateOnline(state: RelevantNetworkState): boolean {
  return state.isConnected === true && state.isInternetReachable !== false;
}

export function configureOnlineManager(): void {
  onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => setOnline(isNetworkStateOnline(state))),
  );
}
