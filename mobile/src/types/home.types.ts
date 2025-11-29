export interface UserProfile {
  id: string;
  name: string;
  email: string;
  unreadCount: number;
}

export interface PeriodInfo {
  nextDate: string; // ISO 8601
  dDay: number;
  currentDay: number;
  cycleLength: number;
  phase: 'period' | 'follicular' | 'ovulation' | 'luteal';
}

export interface DonationProgress {
  currentAmount: number;
  goalAmount: number;
  participantCount: number;
}

export interface RecentAnalysis {
  id: string;
  date: string;
  bloodFlow: string;
  status: 'normal' | 'caution' | 'warning';
}

export interface DailyTip {
  id: string;
  icon: string;
  title: string;
  message: string;
}

export interface QuickAction {
  id: string;
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

export interface HomeData {
  userProfile: UserProfile;
  periodInfo: PeriodInfo;
  donationProgress: DonationProgress;
  recentAnalysis: RecentAnalysis | null;
  dailyTip: DailyTip;
}
