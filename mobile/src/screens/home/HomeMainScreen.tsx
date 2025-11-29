import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { FMText } from '@/components/atoms/FMText';
import { FMButton } from '@/components/atoms/FMButton';
import { LoadingView } from '@/components/molecules/LoadingView';
import { ErrorView } from '@/components/molecules/ErrorView';
import { Colors, Spacing, BorderRadius, Shadows } from '@/styles/tokens';

export const HomeMainScreen: React.FC = () => {
  const navigation = useNavigation();

  // 더미 데이터
  const data = {
    userName: '사용자',
    unreadCount: 2,
    nextPeriodDate: '12월 5일',
    dDay: 3,
    currentDay: 15,
    cycleLength: 28,
    donationProgress: {
      current: 670000,
      goal: 1000000,
      percent: 67,
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <FMText variant="h3">안녕하세요, {data.userName}님</FMText>
        <TouchableOpacity style={styles.notificationBtn}>
          <FMText variant="body2">🔔</FMText>
          {data.unreadCount > 0 && (
            <View style={styles.badge}>
              <FMText variant="caption" color="white">
                {data.unreadCount}
              </FMText>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Period Card */}
        <LinearGradient
          colors={[Colors.primary, '#F5EEE8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.periodCard}
        >
          <FMText variant="body2" color="white" style={styles.periodTitle}>
            다음 생리 예정일
          </FMText>

          <View style={styles.dateSection}>
            <FMText variant="h1" color="white">
              {data.nextPeriodDate}
            </FMText>
            <FMText variant="body1" color="white" style={styles.dDay}>
              (D-{data.dDay})
            </FMText>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(data.currentDay / data.cycleLength) * 100}%` },
                ]}
              />
            </View>
            <FMText variant="caption" color="white" style={styles.progressText}>
              {data.currentDay}일 / {data.cycleLength}일
            </FMText>
          </View>

          <TouchableOpacity style={styles.recordButton}>
            <FMText variant="button" style={{ color: Colors.primary }}>
              기록하기
            </FMText>
          </TouchableOpacity>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <QuickActionItem
            icon="📸"
            label="AI 분석"
            onPress={() => navigation.navigate('CameraGuide' as never)}
          />
          <QuickActionItem
            icon="📅"
            label="캘린더"
            onPress={() => navigation.navigate('Calendar' as never)}
          />
          <QuickActionItem icon="📦" label="구독 관리" onPress={() => {}} />
          <QuickActionItem icon="📊" label="리포트" onPress={() => {}} />
          <QuickActionItem icon="💬" label="상담" onPress={() => {}} />
          <QuickActionItem icon="👥" label="커뮤니티" onPress={() => {}} />
        </View>

        {/* Daily Tip */}
        <View style={styles.tipBanner}>
          <FMText variant="body2" style={styles.tipIcon}>
            💡
          </FMText>
          <View style={styles.tipContent}>
            <FMText variant="body2" color="primary" style={styles.tipTitle}>
              오늘의 건강 팁
            </FMText>
            <FMText variant="caption" color="secondary">
              규칙적인 생활 습관이 건강한 월경 주기를 유지하는 데 도움이 됩니다.
            </FMText>
          </View>
        </View>

        {/* Donation Progress */}
        <View style={styles.donationCard}>
          <FMText variant="h4" style={styles.donationTitle}>
            월경빈곤 캠페인 함께하기 💝
          </FMText>

          <View style={styles.donationProgress}>
            <View style={styles.donationBar}>
              <View
                style={[
                  styles.donationFill,
                  { width: `${data.donationProgress.percent}%` },
                ]}
              />
            </View>
            <FMText variant="caption" color="secondary" style={styles.donationText}>
              {data.donationProgress.percent}% 달성
            </FMText>
          </View>

          <FMButton variant="primary" text="기부하기" onPress={() => {}} />
        </View>
      </ScrollView>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TabItem icon="🏠" label="홈" active />
        <TabItem icon="📅" label="캘린더" />
        <TabItem icon="📦" label="구독" />
        <TabItem icon="💬" label="상담" />
        <TabItem icon="👤" label="마이" />
      </View>
    </SafeAreaView>
  );
};

const QuickActionItem: React.FC<{
  icon: string;
  label: string;
  onPress: () => void;
}> = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.actionItem} onPress={onPress}>
    <FMText variant="h2">{icon}</FMText>
    <FMText variant="caption" color="secondary">
      {label}
    </FMText>
  </TouchableOpacity>
);

const TabItem: React.FC<{
  icon: string;
  label: string;
  active?: boolean;
}> = ({ icon, label, active = false }) => (
  <TouchableOpacity style={styles.tabItem}>
    <FMText variant="body2">{icon}</FMText>
    <FMText variant="caption" color={active ? 'primary' : 'light'}>
      {label}
    </FMText>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  notificationBtn: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  periodCard: {
    borderRadius: BorderRadius.xlarge,
    padding: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    ...Shadows.medium,
  },
  periodTitle: {
    marginBottom: Spacing.sm,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  dDay: {
    marginLeft: Spacing.sm,
    opacity: 0.8,
  },
  progressContainer: {
    marginBottom: Spacing.lg,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.textWhite,
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
  },
  recordButton: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.large,
    paddingVertical: 12,
    alignItems: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  actionItem: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xlarge,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  tipBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xlarge,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    ...Shadows.small,
  },
  tipIcon: {
    marginRight: Spacing.sm,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    marginBottom: Spacing.xs,
  },
  donationCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xlarge,
    padding: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    ...Shadows.small,
  },
  donationTitle: {
    marginBottom: Spacing.md,
  },
  donationProgress: {
    marginBottom: Spacing.md,
  },
  donationBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: Spacing.xs,
  },
  donationFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  donationText: {
    textAlign: 'right',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: Spacing.sm,
    ...Shadows.medium,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
});
