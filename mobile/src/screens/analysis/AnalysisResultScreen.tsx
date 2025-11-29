import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { FMText } from '@/components/atoms/FMText';
import { FMButton } from '@/components/atoms/FMButton';
import { LoadingView } from '@/components/molecules/LoadingView';
import { ErrorView } from '@/components/molecules/ErrorView';
import { Colors, Spacing, BorderRadius, Shadows } from '@/styles/tokens';
import type { RootStackParamList } from '@/types/navigation.types';

type AnalysisResultScreenRouteProp = RouteProp<RootStackParamList, 'AnalysisResult'>;

export const AnalysisResultScreen: React.FC = () => {
  const route = useRoute<AnalysisResultScreenRouteProp>();
  const navigation = useNavigation();
  const { analysisId } = route.params;

  // 더미 데이터
  const data = {
    overallStatus: 'NORMAL',
    timestamp: '2025.11.28 오후 3:24',
    bloodFlow: {
      level: 3,
      text: '보통',
      comment: '이번 주기 평균과 비슷해요',
      comparisonTrend: 'SIMILAR',
    },
    color: {
      status: 'NORMAL',
      colorCode: '#8C4A4A',
      text: '정상 범위',
      comment: '건강한 색상입니다',
    },
    aiComment: '정상적인 월경 상태입니다. 규칙적인 주기를 유지하고 있어요.',
    warning: null,
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = () => {
    console.log('저장 처리');
    navigation.navigate('Home' as never);
  };

  const getStatusGradient = () => {
    switch (data.overallStatus) {
      case 'NORMAL':
        return [Colors.primary, '#F5A97F'];
      case 'CAUTION':
        return ['#F5A97F', Colors.primary];
      case 'WARNING':
        return [Colors.error, '#F5A97F'];
      default:
        return [Colors.primary, '#F5A97F'];
    }
  };

  const getStatusText = () => {
    switch (data.overallStatus) {
      case 'NORMAL':
        return '양호';
      case 'CAUTION':
        return '주의';
      case 'WARNING':
        return '경고';
      default:
        return '양호';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* NavBar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={handleBack}>
          <FMText variant="h3">←</FMText>
        </TouchableOpacity>
        <FMText variant="h4">분석 결과</FMText>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <LinearGradient
          colors={getStatusGradient()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statusCard}
        >
          <FMText variant="body2" color="white" style={styles.statusIcon}>
            ✓
          </FMText>
          <FMText variant="h2" color="white" style={styles.statusText}>
            {getStatusText()}
          </FMText>
          <FMText variant="h3" color="white">
            전반적으로 정상입니다
          </FMText>
          <FMText variant="caption" color="white" style={styles.timestamp}>
            {data.timestamp}
          </FMText>
        </LinearGradient>

        {/* Blood Flow Section */}
        <View style={styles.section}>
          <FMText variant="h4" style={styles.sectionTitle}>
            출혈량
          </FMText>

          <View style={styles.bloodFlowIndicator}>
            {[1, 2, 3, 4, 5].map((level) => (
              <View
                key={level}
                style={[
                  styles.levelDot,
                  level <= data.bloodFlow.level && styles.levelDotFilled,
                ]}
              />
            ))}
          </View>

          <FMText variant="body1" style={styles.levelText}>
            {data.bloodFlow.text}
          </FMText>

          <FMText variant="body2" color="secondary" style={styles.comment}>
            {data.bloodFlow.comment}
          </FMText>

          <View style={styles.comparisonBadge}>
            <FMText variant="caption" style={{ color: Colors.primary }}>
              이번 주기 평균과 비슷해요
            </FMText>
          </View>
        </View>

        {/* Color Section */}
        <View style={styles.section}>
          <FMText variant="h4" style={styles.sectionTitle}>
            색상
          </FMText>

          <View style={styles.colorContainer}>
            <View
              style={[styles.colorIndicator, { backgroundColor: data.color.colorCode }]}
            />
            <FMText variant="body1" style={styles.colorText}>
              {data.color.text}
            </FMText>
          </View>

          <FMText variant="body2" color="secondary" style={styles.comment}>
            {data.color.comment}
          </FMText>
        </View>

        {/* AI Comment */}
        <View style={styles.aiCommentBox}>
          <View style={styles.aiHeader}>
            <FMText variant="body2">💡</FMText>
            <FMText variant="body1" color="primary" style={styles.aiTitle}>
              AI 건강 코멘트
            </FMText>
          </View>
          <FMText variant="body2" color="secondary">
            {data.aiComment}
          </FMText>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <FMButton
          variant="outline"
          text="상세 분석"
          onPress={() => {}}
          style={styles.actionButton}
        />
        <FMButton
          variant="primary"
          text="기록 저장"
          onPress={handleSave}
          style={styles.actionButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  statusCard: {
    borderRadius: BorderRadius.xlarge,
    padding: Spacing.xl,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    alignItems: 'center',
    ...Shadows.large,
  },
  statusIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  statusText: {
    marginBottom: Spacing.xs,
  },
  timestamp: {
    marginTop: Spacing.sm,
    opacity: 0.8,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xlarge,
    padding: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    ...Shadows.small,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  bloodFlowIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  levelDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.border,
  },
  levelDotFilled: {
    backgroundColor: Colors.primary,
  },
  levelText: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  comment: {
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  comparisonBadge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.medium,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    alignSelf: 'center',
    marginTop: Spacing.md,
  },
  colorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  colorIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: Spacing.md,
  },
  colorText: {
    flex: 1,
  },
  aiCommentBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xlarge,
    padding: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    ...Shadows.small,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  aiTitle: {
    marginLeft: Spacing.sm,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
    ...Shadows.medium,
  },
  actionButton: {
    flex: 1,
  },
});
