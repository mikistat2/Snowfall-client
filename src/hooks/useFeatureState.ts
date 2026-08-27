import { useQuery } from '@tanstack/react-query';
import { getFeatureState, type FeatureState } from '../api/features';
import { useAuth } from './useAuth';
import { qk } from './queries/keys';

/**
 * What the platform currently allows this gym, and what it has not been told.
 *
 * Refetched on focus rather than polled: a revocation is rare, and coming back
 * to the tab is exactly when someone is about to be surprised by it.
 */
export function useFeatureState() {
  const { user } = useAuth();
  return useQuery({
    queryKey: qk.features,
    queryFn: getFeatureState,
    enabled: Boolean(user),
    staleTime: 60_000,
    refetchOnWindowFocus: true,
    retry: false,
  });
}

export interface FeatureLocks {
  camera: boolean;
  telegram: boolean;
}

/**
 * The entitlements alone, defaulted to allowed.
 *
 * Optimistic on purpose: this only decides whether to draw an explanatory
 * banner, and the server refuses the endpoints regardless. Assuming "revoked"
 * while the query is in flight would flash a lock on every cold start.
 */
export function useFeatureLocks(): FeatureLocks {
  const { data } = useFeatureState();
  return {
    camera: (data as FeatureState | undefined)?.camera_allowed !== false,
    telegram: (data as FeatureState | undefined)?.telegram_allowed !== false,
  };
}
