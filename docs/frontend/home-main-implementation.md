# FemCare 홈 메인 화면 - React Native 개발 명세서

## 목차
1. [사용될 컴포넌트](#1-사용될-컴포넌트)
2. [Props/State 구조](#2-propsstate-구조)
3. [API 연동 방식](#3-api-연동-방식)
4. [Navigation 흐름](#4-navigation-흐름)
5. [로딩/오류 처리](#5-로딩오류-처리)
6. [Validation 규칙](#6-validation-규칙)
7. [스타일 코드 예시](#7-스타일-코드-예시)
8. [비동기 처리 순서](#8-비동기-처리-순서)
9. [UI 생명주기](#9-ui-생명주기)

---

## 1. 사용될 컴포넌트

### 1.1 디렉토리 구조

```
src/
├── screens/
│   └── home/
│       └── HomeMainScreen.tsx          # Page 컴포넌트
│
├── components/
│   ├── atoms/
│   │   ├── FMButton.tsx
│   │   ├── FMText.tsx
│   │   ├── FMIcon.tsx
│   │   ├── FMBadge.tsx
│   │   ├── FMProgressBar.tsx
│   │   └── FMAvatar.tsx
│   │
│   ├── molecules/
│   │   ├── GreetingHeader.tsx
│   │   ├── CycleProgressIndicator.tsx
│   │   ├── QuickActionItem.tsx
│   │   └── StatCard.tsx
│   │
│   └── organisms/
│       ├── HomeHeader.tsx
│       ├── PeriodCard.tsx
│       ├── QuickActionsGrid.tsx
│       ├── TipBanner.tsx
│       ├── DonationProgressCard.tsx
│       ├── RecentAnalysisCard.tsx
│       └── TabNavigation.tsx
│
├── services/
│   ├── api/
│   │   ├── homeAPI.ts
│   │   └── axiosConfig.ts
│   └── hooks/
│       ├── useHomeData.ts
│       └── useRefresh.ts
│
├── store/
│   ├── slices/
│   │   └── homeSlice.ts
│   └── index.ts
│
├── types/
│   └── home.types.ts
│
├── utils/
│   ├── validation/
│   │   └── homeValidation.ts
│   └── formatters/
│       └── dateFormatter.ts
│
└── styles/
    ├── tokens.ts
    └── theme.ts
```

### 1.2 컴포넌트 임포트 맵

```typescript
// HomeMainScreen.tsx
import React from 'react';
import { SafeAreaView, ScrollView, RefreshControl, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

// Organisms
import { HomeHeader } from '@/components/organisms/HomeHeader';
import { PeriodCard } from '@/components/organisms/PeriodCard';
import { QuickActionsGrid } from '@/components/organisms/QuickActionsGrid';
import { TipBanner } from '@/components/organisms/TipBanner';
import { DonationProgressCard } from '@/components/organisms/DonationProgressCard';
import { RecentAnalysisCard } from '@/components/organisms/RecentAnalysisCard';
import { TabNavigation } from '@/components/organisms/TabNavigation';

// Molecules
import { LoadingView } from '@/components/molecules/LoadingView';
import { ErrorView } from '@/components/molecules/ErrorView';

// Hooks
import { useHomeData } from '@/services/hooks/useHomeData';

// Utils
import { analytics } from '@/utils/analytics';
import { showToast } from '@/utils/toast';

// Styles
import { styles } from './HomeMainScreen.styles';
```

---

## 2. Props/State 구조

### 2.1 TypeScript 타입 정의

```typescript
// types/home.types.ts

export interface HomeMainScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'Home'>;
}

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
  route: keyof RootStackParamList;
  badge?: number;
}

export interface HomeData {
  userProfile: UserProfile;
  periodInfo: PeriodInfo;
  donationProgress: DonationProgress;
  recentAnalysis: RecentAnalysis | null;
  dailyTip: DailyTip;
}

export interface HomeState {
  data: HomeData | null;
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
}
```

### 2.2 Redux State (옵션)

```typescript
// store/slices/homeSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { homeAPI } from '@/services/api/homeAPI';
import type { HomeData, HomeState } from '@/types/home.types';

const initialState: HomeState = {
  data: null,
  loading: false,
  refreshing: false,
  error: null,
};

export const fetchHomeData = createAsyncThunk(
  'home/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const data = await homeAPI.getHomeData();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.refreshing = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHomeData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchHomeData.rejected, (state, action) => {
        state.loading = false;
        state.error = new Error(action.payload as string);
      });
  },
});

export const { clearError, setRefreshing } = homeSlice.actions;
export default homeSlice.reducer;
```

### 2.3 Custom Hook (React Query 사용)

```typescript
// services/hooks/useHomeData.ts

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { homeAPI } from '@/services/api/homeAPI';
import type { HomeData } from '@/types/home.types';

export const useHomeData = () => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery<HomeData, Error>({
    queryKey: ['homeData'],
    queryFn: homeAPI.getHomeData,
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['homeData'] });
  };

  return {
    data,
    loading: isLoading,
    refreshing: isRefetching,
    error: isError ? error : null,
    refetch,
    invalidate,
  };
};
```

---

## 3. API 연동 방식

### 3.1 Axios 설정

```typescript
// services/api/axiosConfig.ts

import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_BASE_URL = __DEV__
  ? Platform.OS === 'ios'
    ? 'http://localhost:8000/api/v1'
    : 'http://10.0.2.2:8000/api/v1'
  : 'https://api.femcare.com/api/v1';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // 401 에러 - 토큰 갱신
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        await AsyncStorage.multiSet([
          ['accessToken', accessToken],
          ['refreshToken', newRefreshToken],
        ]);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // 리프레시 실패 - 로그아웃
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
        // Navigation to Login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
```

### 3.2 Home API 서비스

```typescript
// services/api/homeAPI.ts

import axiosInstance from './axiosConfig';
import type { HomeData, PeriodInfo, DonationProgress, RecentAnalysis, DailyTip, UserProfile } from '@/types/home.types';

class HomeAPI {
  /**
   * 홈 화면 데이터 일괄 조회
   */
  async getHomeData(): Promise<HomeData> {
    try {
      const [
        userResponse,
        periodResponse,
        donationResponse,
        analysisResponse,
        tipResponse,
      ] = await Promise.all([
        this.getUserProfile(),
        this.getPeriodInfo(),
        this.getDonationProgress(),
        this.getRecentAnalysis(),
        this.getDailyTip(),
      ]);

      return {
        userProfile: userResponse,
        periodInfo: periodResponse,
        donationProgress: donationResponse,
        recentAnalysis: analysisResponse,
        dailyTip: tipResponse,
      };
    } catch (error) {
      console.error('[HomeAPI] getHomeData failed:', error);
      throw error;
    }
  }

  /**
   * 사용자 프로필 조회
   */
  async getUserProfile(): Promise<UserProfile> {
    const response = await axiosInstance.get('/user/profile');
    return response.data.data;
  }

  /**
   * 월경 주기 정보 조회
   */
  async getPeriodInfo(): Promise<PeriodInfo> {
    const response = await axiosInstance.get('/health/period/next');
    return this.mapPeriodResponse(response.data.data);
  }

  /**
   * 기부 진행 상황 조회
   */
  async getDonationProgress(): Promise<DonationProgress> {
    const response = await axiosInstance.get('/donation/progress');
    return response.data.data;
  }

  /**
   * 최근 AI 분석 결과 조회
   */
  async getRecentAnalysis(): Promise<RecentAnalysis | null> {
    try {
      const response = await axiosInstance.get('/analysis/recent');
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // 분석 기록 없음
      }
      throw error;
    }
  }

  /**
   * 오늘의 건강 팁 조회
   */
  async getDailyTip(): Promise<DailyTip> {
    try {
      const response = await axiosInstance.get('/health/tips/daily');
      return response.data.data;
    } catch (error) {
      // Fallback tip
      return {
        id: 'default',
        icon: 'lightbulb',
        title: '오늘의 건강 팁',
        message: '규칙적인 생활 습관이 건강한 월경 주기를 유지하는 데 도움이 됩니다.',
      };
    }
  }

  /**
   * API 응답 매핑
   */
  private mapPeriodResponse(data: any): PeriodInfo {
    return {
      nextDate: data.nextDate,
      dDay: data.dDay,
      currentDay: data.currentDay,
      cycleLength: data.cycleLength,
      phase: this.mapPhase(data.phase),
    };
  }

  private mapPhase(phase: string): PeriodInfo['phase'] {
    const phaseMap: Record<string, PeriodInfo['phase']> = {
      '생리기': 'period',
      '난포기': 'follicular',
      '배란기': 'ovulation',
      '생리전기': 'luteal',
    };
    return phaseMap[phase] || 'follicular';
  }
}

export const homeAPI = new HomeAPI();
```

---

## 4. Navigation 흐름

### 4.1 Navigation Types

```typescript
// types/navigation.types.ts

import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  // Auth
  Splash: undefined;
  Onboarding1: undefined;
  Onboarding2: undefined;
  Onboarding3: undefined;
  SignupSelection: undefined;
  Login: undefined;

  // Main Tabs
  MainTabs: NavigatorScreenParams<MainTabParamList>;

  // Modals
  Notifications: undefined;
  SymptomRecord: { date: string };
};

export type MainTabParamList = {
  Home: undefined;
  Calendar: undefined;
  SubscriptionMain: undefined;
  ConsultationMain: undefined;
  MyPageMain: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  CameraGuide: { fromOnboarding?: boolean };
  AnalysisResult: { analysisId: string };
  DonationMain: undefined;
  HealthReportHome: undefined;
  CommunityMain: undefined;
};
```

### 4.2 Navigation 설정

```typescript
// navigation/index.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens
import { HomeMainScreen } from '@/screens/home/HomeMainScreen';
import { CalendarScreen } from '@/screens/health/CalendarScreen';
// ... other screens

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeMainScreen}
        options={{
          tabBarIcon: ({ color }) => <FMIcon name="home" color={color} />,
          tabBarLabel: '홈',
        }}
      />
      {/* Other tabs */}
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        {/* Other screens */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

### 4.3 Navigation Handlers

```typescript
// HomeMainScreen.tsx

const handleNotificationPress = () => {
  navigation.navigate('Notifications');
  analytics.logEvent('home_notification_pressed');
};

const handleRecordPress = () => {
  navigation.navigate('SymptomRecord', {
    date: new Date().toISOString(),
  });
  analytics.logEvent('home_record_pressed');
};

const handleQuickActionPress = (route: keyof RootStackParamList) => {
  navigation.navigate(route);
  analytics.logEvent('home_quick_action_pressed', { route });
};

const handleDonatePress = () => {
  navigation.navigate('DonationMain');
};

const handleAnalysisDetailPress = () => {
  if (data?.recentAnalysis) {
    navigation.navigate('AnalysisResult', {
      analysisId: data.recentAnalysis.id,
    });
  }
};

const handleTabPress = (route: keyof MainTabParamList) => {
  if (route !== 'Home') {
    navigation.navigate('MainTabs', { screen: route });
  }
};
```

---

## 5. 로딩/오류 처리

### 5.1 로딩 상태 컴포넌트

```typescript
// components/molecules/LoadingView.tsx

import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { FMText } from '@/components/atoms/FMText';
import { styles } from './LoadingView.styles';

interface LoadingViewProps {
  message?: string;
}

export const LoadingView: React.FC<LoadingViewProps> = ({
  message = '로딩 중...',
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#F7C8C0" />
      <FMText variant="body2" color="secondary" style={styles.message}>
        {message}
      </FMText>
    </View>
  );
};

// LoadingView.styles.ts
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5EEE8',
  },
  message: {
    marginTop: 16,
  },
});
```

### 5.2 에러 상태 컴포넌트

```typescript
// components/molecules/ErrorView.tsx

import React from 'react';
import { View } from 'react-native';
import { FMText } from '@/components/atoms/FMText';
import { FMButton } from '@/components/atoms/FMButton';
import { FMIcon } from '@/components/atoms/FMIcon';
import { styles } from './ErrorView.styles';

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
      <FMIcon name="alert-circle" size={64} color="#E89B9B" />

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

// ErrorView.styles.ts
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5EEE8',
    padding: 20,
  },
  title: {
    marginTop: 24,
    textAlign: 'center',
  },
  message: {
    marginTop: 8,
    textAlign: 'center',
  },
  errorDetail: {
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 32,
    minWidth: 120,
  },
});
```

### 5.3 에러 바운더리

```typescript
// components/ErrorBoundary.tsx

import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { analytics } from '@/utils/analytics';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
    analytics.logError('error_boundary_triggered', {
      error: error.message,
      stack: errorInfo.componentStack,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#E89B9B' }}>
            앱에 오류가 발생했습니다
          </Text>
          <Text style={{ marginTop: 16, color: '#5A5A5A', textAlign: 'center' }}>
            {this.state.error?.message}
          </Text>
          <TouchableOpacity
            onPress={this.handleReset}
            style={{
              marginTop: 32,
              backgroundColor: '#F7C8C0',
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 20,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
```

### 5.4 Toast 메시지

```typescript
// utils/toast.ts

import Toast from 'react-native-toast-message';

type ToastType = 'success' | 'error' | 'info';

export const showToast = (
  message: string,
  type: ToastType = 'info',
  duration: number = 3000
) => {
  Toast.show({
    type,
    text1: message,
    position: 'bottom',
    visibilityTime: duration,
    autoHide: true,
    bottomOffset: 100,
  });
};

// Toast 설정
export const toastConfig = {
  success: ({ text1 }: any) => (
    <View style={{
      backgroundColor: '#7BC9A6',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 20,
    }}>
      <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>{text1}</Text>
    </View>
  ),
  error: ({ text1 }: any) => (
    <View style={{
      backgroundColor: '#E89B9B',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 20,
    }}>
      <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>{text1}</Text>
    </View>
  ),
  info: ({ text1 }: any) => (
    <View style={{
      backgroundColor: '#F7C8C0',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 20,
    }}>
      <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>{text1}</Text>
    </View>
  ),
};
```

---

## 6. Validation 규칙

### 6.1 데이터 검증 유틸리티

```typescript
// utils/validation/homeValidation.ts

import type { PeriodInfo, DonationProgress } from '@/types/home.types';

/**
 * 날짜 유효성 검증
 */
export const validateDate = (date: string): boolean => {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

/**
 * D-day 유효성 검증
 */
export const validateDDay = (dDay: number): boolean => {
  return Number.isInteger(dDay) && dDay >= -7 && dDay <= 60;
};

/**
 * 주기 길이 검증
 */
export const validateCycleLength = (cycleLength: number): boolean => {
  return Number.isInteger(cycleLength) && cycleLength >= 21 && cycleLength <= 35;
};

/**
 * 현재 날짜 검증
 */
export const validateCurrentDay = (currentDay: number, cycleLength: number): boolean => {
  return (
    Number.isInteger(currentDay) &&
    currentDay >= 1 &&
    currentDay <= cycleLength
  );
};

/**
 * 기부 금액 검증
 */
export const validateDonationAmount = (amount: number): boolean => {
  return Number.isFinite(amount) && amount >= 0 && amount <= 1000000;
};

/**
 * 월경 주기 정보 전체 검증
 */
export const validatePeriodInfo = (info: PeriodInfo): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!validateDate(info.nextDate)) {
    errors.push('유효하지 않은 날짜입니다');
  }

  if (!validateDDay(info.dDay)) {
    errors.push('D-day 값이 유효하지 않습니다');
  }

  if (!validateCycleLength(info.cycleLength)) {
    errors.push('주기 길이는 21-35일 사이여야 합니다');
  }

  if (!validateCurrentDay(info.currentDay, info.cycleLength)) {
    errors.push('현재 날짜가 유효하지 않습니다');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 기부 진행 상황 검증
 */
export const validateDonationProgress = (
  progress: DonationProgress
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!validateDonationAmount(progress.currentAmount)) {
    errors.push('현재 기부 금액이 유효하지 않습니다');
  }

  if (!validateDonationAmount(progress.goalAmount)) {
    errors.push('목표 기부 금액이 유효하지 않습니다');
  }

  if (progress.currentAmount > progress.goalAmount) {
    errors.push('현재 금액이 목표 금액을 초과했습니다');
  }

  if (!Number.isInteger(progress.participantCount) || progress.participantCount < 0) {
    errors.push('참여자 수가 유효하지 않습니다');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
```

### 6.2 런타임 검증

```typescript
// services/hooks/useHomeData.ts (수정)

export const useHomeData = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery<HomeData, Error>({
    queryKey: ['homeData'],
    queryFn: homeAPI.getHomeData,
    select: (data) => {
      // 데이터 검증
      const periodValidation = validatePeriodInfo(data.periodInfo);
      if (!periodValidation.isValid) {
        console.warn('[Validation] Period info validation failed:', periodValidation.errors);
      }

      const donationValidation = validateDonationProgress(data.donationProgress);
      if (!donationValidation.isValid) {
        console.warn('[Validation] Donation validation failed:', donationValidation.errors);
      }

      return data;
    },
    // ...
  });

  // ...
};
```

---

## 7. 스타일 코드 예시 (Lanove 스타일)

### 7.1 디자인 토큰

```typescript
// styles/tokens.ts

export const Colors = {
  // Primary
  primary: '#F7C8C0',
  primaryDark: '#F5A97F',
  primaryLight: 'rgba(247, 200, 192, 0.1)',

  // Background
  background: '#F5EEE8',
  surface: '#FFFFFF',

  // Text
  textPrimary: '#8C6762',
  textSecondary: '#5A5A5A',
  textLight: '#9B9B9B',
  textWhite: '#FFFFFF',

  // Border
  border: '#E5E5E5',
  borderLight: '#F5EEE8',

  // Status
  success: '#7BC9A6',
  warning: '#F5A97F',
  error: '#E89B9B',
  info: '#A8C5E8',
} as const;

export const Typography = {
  fontFamily: 'Pretendard',

  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 39.2, // 1.4
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 33.6,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 30,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 27,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 25.6,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 22.4,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  small: 12,
  medium: 16,
  large: 20,
  xlarge: 22,
  round: 9999,
} as const;

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;
```

### 7.2 HomeMainScreen 스타일

```typescript
// screens/home/HomeMainScreen.styles.ts

import { StyleSheet } from 'react-native';
import { Colors, Spacing } from '@/styles/tokens';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
});
```

### 7.3 PeriodCard 스타일

```typescript
// components/organisms/PeriodCard.styles.ts

import { StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Shadows } from '@/styles/tokens';

export const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xlarge,
    padding: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    ...Shadows.medium,
  },

  // 그라데이션 대체 (LinearGradient 사용)
  gradient: {
    borderRadius: BorderRadius.xlarge,
  },

  title: {
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textWhite,
    marginBottom: Spacing.md,
  },

  dateSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },

  dateText: {
    fontFamily: 'Pretendard',
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textWhite,
    letterSpacing: -0.5,
  },

  dDayText: {
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: Spacing.sm,
  },

  phaseLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },

  phaseLabel: {
    fontFamily: 'Pretendard',
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },

  recordButton: {
    backgroundColor: Colors.textWhite,
    borderRadius: BorderRadius.large,
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },

  recordButtonText: {
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
});
```

### 7.4 LinearGradient 사용 예시

```typescript
// components/organisms/PeriodCard.tsx

import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { FMText } from '@/components/atoms/FMText';
import { CycleProgressIndicator } from '@/components/molecules/CycleProgressIndicator';
import { styles } from './PeriodCard.styles';

export const PeriodCard: React.FC<PeriodCardProps> = ({
  nextPeriodDate,
  dDay,
  currentDay,
  cycleLength,
  onRecordPress,
}) => {
  return (
    <LinearGradient
      colors={['#F7C8C0', '#F5EEE8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, styles.gradient]}
    >
      <FMText style={styles.title}>다음 생리 예정일</FMText>

      <View style={styles.dateSection}>
        <FMText style={styles.dateText}>
          {formatDate(nextPeriodDate)}
        </FMText>
        <FMText style={styles.dDayText}>(D-{dDay})</FMText>
      </View>

      <CycleProgressIndicator
        currentDay={currentDay}
        totalDays={cycleLength}
      />

      <View style={styles.phaseLabels}>
        <FMText style={styles.phaseLabel}>생리기</FMText>
        <FMText style={styles.phaseLabel}>배란기</FMText>
        <FMText style={styles.phaseLabel}>생리전기</FMText>
      </View>

      <TouchableOpacity style={styles.recordButton} onPress={onRecordPress}>
        <FMText style={styles.recordButtonText}>기록하기</FMText>
      </TouchableOpacity>
    </LinearGradient>
  );
};
```

---

## 8. 비동기 처리 순서

### 8.1 초기 로딩 플로우

```typescript
/**
 * 홈 화면 초기 로딩 시퀀스
 *
 * 1. 컴포넌트 마운트
 *    - useHomeData() 훅 초기화
 *    - React Query가 캐시 확인
 *
 * 2. 캐시 없음 → API 요청 시작
 *    - loading: true
 *    - fetchHomeData() 실행
 *
 * 3. API 병렬 요청 (Promise.all)
 *    3-1. getUserProfile()      - 약 200ms
 *    3-2. getPeriodInfo()       - 약 300ms
 *    3-3. getDonationProgress() - 약 250ms
 *    3-4. getRecentAnalysis()   - 약 400ms (조건부)
 *    3-5. getDailyTip()         - 약 200ms
 *
 * 4. 모든 API 응답 대기
 *    - 가장 느린 요청 기준: ~400ms
 *
 * 5. 데이터 검증
 *    - validatePeriodInfo()
 *    - validateDonationProgress()
 *
 * 6. 상태 업데이트
 *    - loading: false
 *    - data: HomeData
 *
 * 7. UI 렌더링
 *    - 컴포넌트들 순차적으로 렌더링
 *    - 애니메이션 시작
 *
 * 총 소요 시간: ~500ms (네트워크 상태 양호 시)
 */
```

### 8.2 Pull to Refresh 플로우

```typescript
/**
 * Pull to Refresh 시퀀스
 *
 * 1. 사용자가 스크롤 당김
 *    - onRefresh 트리거
 *
 * 2. refreshing 상태 업데이트
 *    - refreshing: true
 *    - RefreshControl 스피너 표시
 *
 * 3. refetch() 실행
 *    - 기존 캐시 무효화
 *    - 새로운 API 요청 시작
 *
 * 4. 병렬 API 요청 (초기 로딩과 동일)
 *
 * 5. 응답 처리
 *    - 데이터 검증
 *    - 상태 업데이트
 *
 * 6. refreshing 종료
 *    - refreshing: false
 *    - RefreshControl 스피너 숨김
 *
 * 7. Toast 메시지 (옵션)
 *    - "새로고침 완료"
 *
 * 총 소요 시간: ~500ms
 */
```

### 8.3 포커스 시 갱신 플로우

```typescript
/**
 * 화면 포커스 시 데이터 갱신
 *
 * 1. 다른 화면에서 돌아옴
 *    - useFocusEffect 트리거
 *
 * 2. 마지막 갱신 시간 확인
 *    - staleTime(5분) 경과 확인
 *
 * 3. staleTime 경과 시
 *    - 백그라운드에서 refetch
 *    - loading: false 유지 (기존 데이터 표시)
 *
 * 4. 새 데이터 도착
 *    - 부드럽게 UI 업데이트
 *
 * 5. staleTime 미경과 시
 *    - 캐시된 데이터 사용
 *    - API 요청 없음
 */
```

### 8.4 에러 재시도 플로우

```typescript
/**
 * 에러 발생 시 재시도 로직
 *
 * 1. API 요청 실패
 *    - 네트워크 에러
 *    - 서버 에러 (5xx)
 *
 * 2. React Query 자동 재시도
 *    - 1차 재시도: 1초 후
 *    - 2차 재시도: 2초 후
 *    - 3차 재시도: 4초 후
 *
 * 3. 모든 재시도 실패
 *    - error 상태 설정
 *    - ErrorView 표시
 *
 * 4. 사용자가 "다시 시도" 클릭
 *    - refetch() 수동 실행
 *    - 1단계부터 재시작
 */
```

---

## 9. UI 생명주기 (Hooks)

### 9.1 HomeMainScreen 전체 코드

```typescript
// screens/home/HomeMainScreen.tsx

import React, { useCallback } from 'react';
import { SafeAreaView, ScrollView, RefreshControl, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

// Components
import { HomeHeader } from '@/components/organisms/HomeHeader';
import { PeriodCard } from '@/components/organisms/PeriodCard';
import { QuickActionsGrid } from '@/components/organisms/QuickActionsGrid';
import { TipBanner } from '@/components/organisms/TipBanner';
import { DonationProgressCard } from '@/components/organisms/DonationProgressCard';
import { RecentAnalysisCard } from '@/components/organisms/RecentAnalysisCard';
import { TabNavigation } from '@/components/organisms/TabNavigation';
import { LoadingView } from '@/components/molecules/LoadingView';
import { ErrorView } from '@/components/molecules/ErrorView';

// Hooks
import { useHomeData } from '@/services/hooks/useHomeData';

// Utils
import { analytics } from '@/utils/analytics';
import { showToast } from '@/utils/toast';

// Types
import type { HomeMainScreenProps, QuickAction } from '@/types/home.types';

// Styles
import { styles } from './HomeMainScreen.styles';

export const HomeMainScreen: React.FC<HomeMainScreenProps> = ({ navigation }) => {
  // ===== Hooks =====
  const { data, loading, refreshing, error, refetch, invalidate } = useHomeData();

  // ===== 화면 포커스 시 갱신 =====
  useFocusEffect(
    useCallback(() => {
      // 화면에 포커스될 때마다 데이터 무효화 (staleTime 체크)
      invalidate();

      // Analytics
      analytics.logScreenView('home_main');

      return () => {
        // Cleanup (필요 시)
      };
    }, [invalidate])
  );

  // ===== Quick Actions 설정 =====
  const quickActions: QuickAction[] = [
    { id: '1', icon: 'camera', label: 'AI 분석', route: 'CameraGuide' },
    { id: '2', icon: 'calendar', label: '캘린더', route: 'Calendar' },
    { id: '3', icon: 'box', label: '구독 관리', route: 'SubscriptionMain' },
    { id: '4', icon: 'chart', label: '건강 리포트', route: 'HealthReportHome' },
    { id: '5', icon: 'message-circle', label: '상담 예약', route: 'ConsultationMain' },
    { id: '6', icon: 'users', label: '커뮤니티', route: 'CommunityMain' },
  ];

  // ===== Event Handlers =====
  const handleRefresh = useCallback(async () => {
    await refetch();
    showToast('새로고침 완료', 'success');
  }, [refetch]);

  const handleNotificationPress = useCallback(() => {
    navigation.navigate('Notifications');
    analytics.logEvent('home_notification_pressed');
  }, [navigation]);

  const handleRecordPress = useCallback(() => {
    navigation.navigate('SymptomRecord', {
      date: new Date().toISOString(),
    });
    analytics.logEvent('home_record_pressed');
  }, [navigation]);

  const handleQuickActionPress = useCallback(
    (route: QuickAction['route']) => {
      navigation.navigate(route as any);
      analytics.logEvent('home_quick_action_pressed', { route });
    },
    [navigation]
  );

  const handleTipPress = useCallback(() => {
    if (data?.dailyTip) {
      navigation.navigate('HealthTipDetail', {
        tipId: data.dailyTip.id,
      });
    }
  }, [navigation, data?.dailyTip]);

  const handleDonatePress = useCallback(() => {
    navigation.navigate('DonationMain');
    analytics.logEvent('home_donate_pressed');
  }, [navigation]);

  const handleDonationDetailPress = useCallback(() => {
    navigation.navigate('DonationProgress');
  }, [navigation]);

  const handleAnalysisDetailPress = useCallback(() => {
    if (data?.recentAnalysis) {
      navigation.navigate('AnalysisResult', {
        analysisId: data.recentAnalysis.id,
      });
      analytics.logEvent('home_analysis_detail_pressed');
    }
  }, [navigation, data?.recentAnalysis]);

  const handleTabPress = useCallback(
    (route: string) => {
      if (route !== 'Home') {
        navigation.navigate('MainTabs', { screen: route as any });
        analytics.logEvent('tab_pressed', { route });
      }
    },
    [navigation]
  );

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // ===== Render Loading =====
  if (loading && !data) {
    return <LoadingView message="데이터를 불러오는 중..." />;
  }

  // ===== Render Error =====
  if (error && !data) {
    return (
      <ErrorView
        error={error}
        onRetry={handleRetry}
        message="홈 데이터를 불러오는데 실패했습니다"
      />
    );
  }

  // ===== Render Main UI =====
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <HomeHeader
        userName={data?.userProfile.name || '사용자'}
        unreadNotifications={data?.userProfile.unreadCount || 0}
        onNotificationPress={handleNotificationPress}
      />

      {/* ScrollView with Pull to Refresh */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#F7C8C0"
            colors={['#F7C8C0']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Period Card */}
        {data?.periodInfo && (
          <PeriodCard
            nextPeriodDate={data.periodInfo.nextDate}
            dDay={data.periodInfo.dDay}
            currentDay={data.periodInfo.currentDay}
            cycleLength={data.periodInfo.cycleLength}
            currentPhase={data.periodInfo.phase}
            onRecordPress={handleRecordPress}
          />
        )}

        {/* Quick Actions Grid */}
        <QuickActionsGrid
          actions={quickActions}
          onActionPress={handleQuickActionPress}
        />

        {/* Daily Tip Banner */}
        {data?.dailyTip && (
          <TipBanner
            icon={data.dailyTip.icon}
            title={data.dailyTip.title}
            message={data.dailyTip.message}
            onPress={handleTipPress}
          />
        )}

        {/* Donation Progress */}
        {data?.donationProgress && (
          <DonationProgressCard
            currentAmount={data.donationProgress.currentAmount}
            goalAmount={data.donationProgress.goalAmount}
            participantCount={data.donationProgress.participantCount}
            onDonatePress={handleDonatePress}
            onDetailPress={handleDonationDetailPress}
          />
        )}

        {/* Recent Analysis (조건부) */}
        {data?.recentAnalysis && (
          <RecentAnalysisCard
            date={data.recentAnalysis.date}
            bloodFlow={data.recentAnalysis.bloodFlow}
            status={data.recentAnalysis.status}
            onPress={handleAnalysisDetailPress}
          />
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Tab Navigation */}
      <TabNavigation currentRoute="Home" onTabPress={handleTabPress} />
    </SafeAreaView>
  );
};
```

### 9.2 생명주기 다이어그램

```typescript
/**
 * HomeMainScreen 생명주기
 *
 * ┌─────────────────────────────────────────────────────┐
 * │ 1. Component Mount                                  │
 * │    - useHomeData() 훅 초기화                        │
 * │    - React Query 캐시 확인                          │
 * └─────────────────┬───────────────────────────────────┘
 *                   │
 *                   ▼
 * ┌─────────────────────────────────────────────────────┐
 * │ 2. Initial Data Fetch (캐시 없을 시)                │
 * │    - loading: true                                  │
 * │    - API 병렬 요청 시작                             │
 * │    - LoadingView 렌더링                             │
 * └─────────────────┬───────────────────────────────────┘
 *                   │
 *                   ▼
 * ┌─────────────────────────────────────────────────────┐
 * │ 3. Data Received                                    │
 * │    - 데이터 검증                                    │
 * │    - loading: false                                 │
 * │    - data 상태 업데이트                             │
 * └─────────────────┬───────────────────────────────────┘
 *                   │
 *                   ▼
 * ┌─────────────────────────────────────────────────────┐
 * │ 4. Main UI Render                                   │
 * │    - 모든 컴포넌트 렌더링                           │
 * │    - 애니메이션 시작                                │
 * └─────────────────┬───────────────────────────────────┘
 *                   │
 *       ┌───────────┴───────────┐
 *       │                       │
 *       ▼                       ▼
 * ┌─────────────┐     ┌──────────────────┐
 * │ 5a. Focus   │     │ 5b. Pull to      │
 * │    Effect   │     │     Refresh      │
 * │  - invalidate()   │  - refetch()     │
 * │  - analytics      │  - refreshing    │
 * └─────┬───────┘     └────────┬─────────┘
 *       │                      │
 *       │                      │
 *       ▼                      ▼
 * ┌─────────────────────────────────────────────────────┐
 * │ 6. Background Refetch (staleTime 체크)              │
 * │    - 기존 UI 유지                                   │
 * │    - 백그라운드 API 요청                            │
 * └─────────────────┬───────────────────────────────────┘
 *                   │
 *                   ▼
 * ┌─────────────────────────────────────────────────────┐
 * │ 7. Data Update                                      │
 * │    - 새 데이터로 부드럽게 전환                      │
 * │    - Toast 메시지 표시 (옵션)                       │
 * └─────────────────┬───────────────────────────────────┘
 *                   │
 *                   │ (계속 반복)
 *                   │
 * ┌─────────────────▼───────────────────────────────────┐
 * │ 8. Component Unmount                                │
 * │    - Cleanup                                        │
 * │    - Event listeners 제거                           │
 * └─────────────────────────────────────────────────────┘
 */
```

---

## 10. 패키지 의존성

### 10.1 package.json

```json
{
  "name": "femcare",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-native": "^0.73.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/native-stack": "^6.9.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "@tanstack/react-query": "^5.0.0",
    "@reduxjs/toolkit": "^2.0.0",
    "react-redux": "^9.0.0",
    "axios": "^1.6.0",
    "@react-native-async-storage/async-storage": "^1.21.0",
    "react-native-linear-gradient": "^2.8.0",
    "react-native-toast-message": "^2.1.0",
    "react-native-safe-area-context": "^4.8.0",
    "react-native-screens": "^3.29.0",
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-native": "^0.73.0",
    "typescript": "^5.3.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "prettier": "^3.1.0"
  }
}
```

---

## 11. 성능 최적화

### 11.1 Memoization

```typescript
// 컴포넌트 메모이제이션
export const PeriodCard = React.memo<PeriodCardProps>(
  ({ nextPeriodDate, dDay, currentDay, cycleLength, onRecordPress }) => {
    // ...
  },
  (prevProps, nextProps) => {
    // 커스텀 비교 함수
    return (
      prevProps.nextPeriodDate === nextProps.nextPeriodDate &&
      prevProps.dDay === nextProps.dDay &&
      prevProps.currentDay === nextProps.currentDay &&
      prevProps.cycleLength === nextProps.cycleLength
    );
  }
);

// useCallback 사용
const handleRecordPress = useCallback(() => {
  navigation.navigate('SymptomRecord', {
    date: new Date().toISOString(),
  });
}, [navigation]);

// useMemo 사용
const quickActions = useMemo<QuickAction[]>(
  () => [
    { id: '1', icon: 'camera', label: 'AI 분석', route: 'CameraGuide' },
    // ...
  ],
  []
);
```

### 11.2 이미지 최적화

```typescript
// react-native-fast-image 사용
import FastImage from 'react-native-fast-image';

<FastImage
  source={{
    uri: imageUrl,
    priority: FastImage.priority.normal,
    cache: FastImage.cacheControl.immutable,
  }}
  resizeMode={FastImage.resizeMode.cover}
  style={{ width: 100, height: 100 }}
/>
```

### 11.3 FlatList 최적화 (리스트 화면용)

```typescript
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

---

이 문서는 FemCare 홈 메인 화면의 완전한 React Native 구현 명세서입니다.
