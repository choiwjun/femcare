import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FMText } from '@/components/atoms/FMText';
import { FMButton } from '@/components/atoms/FMButton';
import { Colors, Spacing } from '@/styles/tokens';

interface ErrorViewProps {
  error?: Error;
  onRetry: () => void;
  message?: string;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  error,
  onRetry,
  message = '데이터를 불러오는데 실패했습니다',
}) => {
  return (
    <View style={styles.container}>
      <FMText variant="h3" style={styles.title}>
        오류가 발생했습니다
      </FMText>

      <FMText variant="body2" color="secondary" style={styles.message}>
        {message}
      </FMText>

      {__DEV__ && error && (
        <FMText variant="caption" color="error" style={styles.errorDetail}>
          {error.message}
        </FMText>
      )}

      <FMButton
        variant="primary"
        text="다시 시도"
        onPress={onRetry}
        style={styles.retryButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  title: {
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  message: {
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  errorDetail: {
    marginTop: Spacing.md,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  retryButton: {
    marginTop: Spacing.xl,
    minWidth: 120,
  },
});
