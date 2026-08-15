import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { radius, spacing, typography } from '../../../../theme/theme';
import { useAppTheme } from '../../../../theme/use-app-theme';

type CaptureSectionProps = { children: ReactNode; title: string };

export function CaptureSection({ children, title }: CaptureSectionProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text accessibilityRole="header" style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

type CaptureActionButtonProps = { disabled?: boolean; label: string; onPress: () => void };

export function CaptureActionButton({
  disabled = false,
  label,
  onPress,
}: CaptureActionButtonProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        { borderColor: colors.action },
        (disabled || pressed) && styles.dimmed,
      ]}
    >
      <Text style={[styles.actionButtonText, { color: colors.action }]}>{label}</Text>
    </Pressable>
  );
}

type CaptureTextAreaProps = {
  accessibilityHint?: string;
  accessibilityLabel: string;
  hasError: boolean;
  onBlur: () => void;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
};

export function CaptureTextArea({
  accessibilityHint,
  accessibilityLabel,
  hasError,
  onBlur,
  onChangeText,
  placeholder,
  value,
}: CaptureTextAreaProps) {
  const { colors } = useAppTheme();

  return (
    <TextInput
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      multiline
      onBlur={onBlur}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textSecondary}
      style={[
        styles.textArea,
        {
          backgroundColor: colors.surface,
          borderColor: hasError ? colors.error : colors.border,
          color: colors.textPrimary,
        },
      ]}
      value={value}
    />
  );
}

export function CaptureFieldError({ message }: { message?: string }) {
  const { colors } = useAppTheme();

  return message ? (
    <Text accessibilityRole="alert" style={[styles.fieldError, { color: colors.error }]}>
      {message}
    </Text>
  ) : null;
}

const styles = StyleSheet.create({
  section: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
    marginBottom: spacing.md,
  },
  actionButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    borderWidth: 2,
    justifyContent: 'center',
    marginTop: spacing.md,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  dimmed: { opacity: 0.55 },
  textArea: {
    ...typography.body,
    borderRadius: radius.sm,
    borderWidth: 1,
    minHeight: 112,
    padding: spacing.md,
    textAlignVertical: 'top',
  },
  fieldError: { ...typography.body, marginTop: spacing.sm },
});
