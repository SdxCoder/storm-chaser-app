import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { resolveDurableStormPhotoUri } from '../../../services/photo-storage/storm-photo-storage';
import { radius, spacing, typography } from '../../../theme/theme';
import { useAppTheme } from '../../../theme/use-app-theme';

export function StormRecordPhoto({ photoUri }: { photoUri: string }) {
  const { colors } = useAppTheme();
  const [isMissing, setIsMissing] = useState(false);
  const resolvedPhotoUri = resolveDurableStormPhotoUri(photoUri);

  useEffect(() => {
    setIsMissing(false);
  }, [photoUri]);

  if (resolvedPhotoUri === null || isMissing) {
    return (
      <View
        accessible
        accessibilityLabel="Saved storm photo is missing. The storm metadata is still available."
        accessibilityRole="image"
        style={[styles.missing, { backgroundColor: colors.surfaceElevated }]}
      >
        <Text accessibilityRole="alert" style={[styles.missingText, { color: colors.warning }]}>
          The saved photo is missing, but the storm metadata is still available.
        </Text>
      </View>
    );
  }

  return (
    <Image
      accessible
      accessibilityLabel="Saved storm photo"
      accessibilityRole="image"
      onError={() => setIsMissing(true)}
      resizeMode="cover"
      source={{ uri: resolvedPhotoUri }}
      style={[styles.photo, { backgroundColor: colors.surfaceElevated }]}
    />
  );
}

const styles = StyleSheet.create({
  photo: { borderRadius: radius.lg, height: 260, width: '100%' },
  missing: {
    alignItems: 'center',
    borderRadius: radius.lg,
    justifyContent: 'center',
    minHeight: 180,
    padding: spacing.lg,
  },
  missingText: { ...typography.body, textAlign: 'center' },
});
