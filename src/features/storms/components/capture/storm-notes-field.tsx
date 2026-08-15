import { type Control, Controller } from 'react-hook-form';
import { StyleSheet, Text } from 'react-native';

import { spacing } from '../../../../theme/theme';
import { useAppTheme } from '../../../../theme/use-app-theme';
import {
  NOTES_MAX_LENGTH,
  type StormMetadata,
  validateNotes,
} from '../../model/storm-draft';
import { CaptureFieldError, CaptureSection, CaptureTextArea } from './capture-ui';

type StormNotesFieldProps = {
  control: Control<StormMetadata>;
  errorMessage?: string;
};

export function StormNotesField({ control, errorMessage }: StormNotesFieldProps) {
  const { colors } = useAppTheme();

  return (
    <CaptureSection title="Notes (optional)">
      <Controller
        control={control}
        name="notes"
        rules={{ validate: (value) => validateNotes(value) ?? true }}
        render={({ field: { onBlur, onChange, value } }) => (
          <>
            <CaptureTextArea
              accessibilityHint={errorMessage}
              accessibilityLabel="Storm notes"
              hasError={Boolean(errorMessage)}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Add movement, damage, or other useful context"
              value={value}
            />
            <Text style={[styles.characterCount, { color: colors.textSecondary }]}>
              {value.length}/{NOTES_MAX_LENGTH}
            </Text>
          </>
        )}
      />
      <CaptureFieldError message={errorMessage} />
    </CaptureSection>
  );
}

const styles = StyleSheet.create({
  characterCount: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
});
