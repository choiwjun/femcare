import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { FMText } from '@/components/atoms/FMText';
import { Colors, Spacing } from '@/styles/tokens';

interface LoadingViewProps {
  message?: string;
}

export const LoadingView: React.FC<LoadingViewProps> = ({
  message = '로딩 중...',
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <FMText variant="body2" color="secondary" style={styles.message}>
        {message}
      </FMText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  message: {
    marginTop: Spacing.md,
  },
});
