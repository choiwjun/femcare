import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  // Auth
  Splash: undefined;
  Onboarding1: undefined;
  Onboarding2: undefined;
  Onboarding3: undefined;
  Login: undefined;
  Signup: undefined;

  // Main Tabs
  MainTabs: NavigatorScreenParams<MainTabParamList>;

  // AI Analysis
  CameraGuide: { fromOnboarding?: boolean };
  Camera: undefined;
  AnalysisLoading: { analysisId: string };
  AnalysisResult: { analysisId: string };

  // Modals
  Notifications: undefined;
  SymptomRecord: { date: string };
};

export type MainTabParamList = {
  Home: undefined;
  Calendar: undefined;
  Subscription: undefined;
  Consultation: undefined;
  MyPage: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  CameraGuide: { fromOnboarding?: boolean };
  AnalysisResult: { analysisId: string };
  DonationMain: undefined;
  HealthReportHome: undefined;
  CommunityMain: undefined;
};
