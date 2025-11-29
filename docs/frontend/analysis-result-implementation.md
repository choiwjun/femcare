# FemCare AI 분석 결과 화면 - React Native 개발 명세서

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
│   └── analysis/
│       └── AnalysisResultScreen.tsx    # Page 컴포넌트
│
├── components/
│   ├── atoms/
│   │   ├── FMButton.tsx
│   │   ├── FMText.tsx
│   │   ├── FMIcon.tsx
│   │   ├── StatusIcon.tsx              # 상태 아이콘 (✓/⚠)
│   │   ├── LevelDot.tsx                # 출혈량 레벨 점
│   │   └── ColorIndicator.tsx          # 색상 원형 인디케이터
│   │
│   ├── molecules/
│   │   ├── NavBar.tsx
│   │   ├── BloodFlowIndicator.tsx      # 출혈량 인디케이터
│   │   ├── ComparisonBadge.tsx         # 비교 배지
│   │   ├── CommentCard.tsx             # 코멘트 카드
│   │   ├── LoadingView.tsx
│   │   └── ErrorView.tsx
│   │
│   └── organisms/
│       ├── AnalysisStatusCard.tsx      # 전체 상태 카드
│       ├── BloodFlowSection.tsx        # 출혈량 섹션
│       ├── ColorAnalysisSection.tsx    # 색상 분석 섹션
│       ├── AICommentBox.tsx            # AI 코멘트 박스
│       ├── WarningBox.tsx              # 주의사항 박스
│       └── BottomActions.tsx           # 하단 액션 버튼
│
├── services/
│   ├── api/
│   │   ├── analysisAPI.ts
│   │   └── axiosConfig.ts
│   └── hooks/
│       ├── useAnalysisData.ts
│       └── useAnalysisSave.ts
│
├── types/
│   └── analysis.types.ts
│
├── utils/
│   ├── validation/
│   │   └── analysisValidation.ts
│   └── formatters/
│       └── analysisFormatter.ts
│
└── styles/
    ├── tokens.ts
    └── theme.ts
```

### 1.2 컴포넌트 임포트 맵

```typescript
// AnalysisResultScreen.tsx
import React from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';

// Organisms
import { NavBar } from '@/components/molecules/NavBar';
import { AnalysisStatusCard } from '@/components/organisms/AnalysisStatusCard';
import { BloodFlowSection } from '@/components/organisms/BloodFlowSection';
import { ColorAnalysisSection } from '@/components/organisms/ColorAnalysisSection';
import { AICommentBox } from '@/components/organisms/AICommentBox';
import { WarningBox } from '@/components/organisms/WarningBox';
import { BottomActions } from '@/components/organisms/BottomActions';

// Molecules
import { LoadingView } from '@/components/molecules/LoadingView';
import { ErrorView } from '@/components/molecules/ErrorView';

// Hooks
import { useAnalysisData } from '@/services/hooks/useAnalysisData';
import { useAnalysisSave } from '@/services/hooks/useAnalysisSave';

// Utils
import { analytics } from '@/utils/analytics';
import { showToast } from '@/utils/toast';

// Styles
import { styles } from './AnalysisResultScreen.styles';
```

---

## 2. Props/State 구조

### 2.1 TypeScript 타입 정의

```typescript
// types/analysis.types.ts

export interface AnalysisResultScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'AnalysisResult'>;
}

export type AnalysisStatus = 'normal' | 'caution' | 'warning';

export interface BloodFlowAnalysis {
  level: number; // 1-5
  text: string; // "적음", "보통", "많음"
  comment: string;
  comparisonTrend: 'similar' | 'higher' | 'lower';
}

export interface ColorAnalysis {
  status: AnalysisStatus;
  colorCode: string; // HEX 색상
  text: string; // "정상 범위", "주의 필요"
  comment: string;
}

export interface WarningInfo {
  title: string;
  message: string;
  severity: 'caution' | 'warning';
  actionRequired: boolean;
  actionText?: string;
}

export interface AnalysisData {
  id: string;
  userId: string;
  timestamp: string; // ISO 8601
  imageUrl: string;
  overallStatus: AnalysisStatus;
  bloodFlow: BloodFlowAnalysis;
  color: ColorAnalysis;
  aiComment: string;
  warning: WarningInfo | null;
}

export interface AnalysisState {
  data: AnalysisData | null;
  loading: boolean;
  saving: boolean;
  error: Error | null;
}

export interface SaveAnalysisRequest {
  analysisId: string;
  date: string;
  notes?: string;
  tags?: string[];
}
```

### 2.2 Redux State (옵션)

```typescript
// store/slices/analysisSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { analysisAPI } from '@/services/api/analysisAPI';
import type { AnalysisData, AnalysisState } from '@/types/analysis.types';

const initialState: AnalysisState = {
  data: null,
  loading: false,
  saving: false,
  error: null,
};

export const fetchAnalysisData = createAsyncThunk(
  'analysis/fetchData',
  async (analysisId: string, { rejectWithValue }) => {
    try {
      const data = await analysisAPI.getAnalysisResult(analysisId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveAnalysisRecord = createAsyncThunk(
  'analysis/saveRecord',
  async (request: SaveAnalysisRequest, { rejectWithValue }) => {
    try {
      await analysisAPI.saveRecord(request);
      return request.analysisId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAnalysis: (state) => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Analysis
      .addCase(fetchAnalysisData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalysisData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAnalysisData.rejected, (state, action) => {
        state.loading = false;
        state.error = new Error(action.payload as string);
      })
      // Save Record
      .addCase(saveAnalysisRecord.pending, (state) => {
        state.saving = true;
      })
      .addCase(saveAnalysisRecord.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(saveAnalysisRecord.rejected, (state, action) => {
        state.saving = false;
        state.error = new Error(action.payload as string);
      });
  },
});

export const { clearError, clearAnalysis } = analysisSlice.actions;
export default analysisSlice.reducer;
```

### 2.3 Custom Hooks (React Query 사용)

```typescript
// services/hooks/useAnalysisData.ts

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { analysisAPI } from '@/services/api/analysisAPI';
import type { AnalysisData } from '@/types/analysis.types';

export const useAnalysisData = (analysisId: string) => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<AnalysisData, Error>({
    queryKey: ['analysisData', analysisId],
    queryFn: () => analysisAPI.getAnalysisResult(analysisId),
    staleTime: 1000 * 60 * 30, // 30분 (분석 결과는 변경되지 않음)
    gcTime: 1000 * 60 * 60, // 1시간
    retry: 2,
    enabled: !!analysisId, // analysisId가 있을 때만 실행
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['analysisData', analysisId] });
  };

  return {
    data,
    loading: isLoading,
    error: isError ? error : null,
    refetch,
    invalidate,
  };
};
```

```typescript
// services/hooks/useAnalysisSave.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { analysisAPI } from '@/services/api/analysisAPI';
import type { SaveAnalysisRequest } from '@/types/analysis.types';

export const useAnalysisSave = () => {
  const queryClient = useQueryClient();

  const {
    mutate: saveRecord,
    mutateAsync: saveRecordAsync,
    isPending: saving,
    isError,
    error,
  } = useMutation({
    mutationFn: (request: SaveAnalysisRequest) =>
      analysisAPI.saveRecord(request),
    onSuccess: () => {
      // 홈 데이터 무효화 (최근 분석 업데이트)
      queryClient.invalidateQueries({ queryKey: ['homeData'] });
      // 건강 기록 무효화
      queryClient.invalidateQueries({ queryKey: ['healthRecords'] });
    },
  });

  return {
    saveRecord,
    saveRecordAsync,
    saving,
    error: isError ? error : null,
  };
};
```

---

## 3. API 연동 방식

### 3.1 Analysis API 서비스

```typescript
// services/api/analysisAPI.ts

import axiosInstance from './axiosConfig';
import type {
  AnalysisData,
  SaveAnalysisRequest
} from '@/types/analysis.types';

class AnalysisAPI {
  /**
   * 분석 결과 조회
   */
  async getAnalysisResult(analysisId: string): Promise<AnalysisData> {
    try {
      const response = await axiosInstance.get(`/analysis/${analysisId}`);
      return this.mapAnalysisResponse(response.data.data);
    } catch (error) {
      console.error('[AnalysisAPI] getAnalysisResult failed:', error);
      throw error;
    }
  }

  /**
   * 분석 결과 기록 저장
   */
  async saveRecord(request: SaveAnalysisRequest): Promise<void> {
    try {
      await axiosInstance.post('/health/record', {
        analysisId: request.analysisId,
        date: request.date,
        notes: request.notes,
        tags: request.tags,
      });
    } catch (error) {
      console.error('[AnalysisAPI] saveRecord failed:', error);
      throw error;
    }
  }

  /**
   * 분석 결과 삭제
   */
  async deleteAnalysis(analysisId: string): Promise<void> {
    try {
      await axiosInstance.delete(`/analysis/${analysisId}`);
    } catch (error) {
      console.error('[AnalysisAPI] deleteAnalysis failed:', error);
      throw error;
    }
  }

  /**
   * 분석 결과 공유 링크 생성
   */
  async createShareLink(analysisId: string): Promise<string> {
    try {
      const response = await axiosInstance.post(`/analysis/${analysisId}/share`);
      return response.data.data.shareUrl;
    } catch (error) {
      console.error('[AnalysisAPI] createShareLink failed:', error);
      throw error;
    }
  }

  /**
   * API 응답 매핑
   */
  private mapAnalysisResponse(data: any): AnalysisData {
    return {
      id: data.id,
      userId: data.userId,
      timestamp: data.timestamp,
      imageUrl: data.imageUrl,
      overallStatus: this.mapStatus(data.overallStatus),
      bloodFlow: {
        level: data.bloodFlow.level,
        text: this.getBloodFlowText(data.bloodFlow.level),
        comment: data.bloodFlow.comment,
        comparisonTrend: data.bloodFlow.comparisonTrend || 'similar',
      },
      color: {
        status: this.mapStatus(data.color.status),
        colorCode: data.color.colorCode,
        text: data.color.text,
        comment: data.color.comment,
      },
      aiComment: data.aiComment,
      warning: data.warning ? {
        title: data.warning.title,
        message: data.warning.message,
        severity: data.warning.severity,
        actionRequired: data.warning.actionRequired,
        actionText: data.warning.actionText,
      } : null,
    };
  }

  private mapStatus(status: string): 'normal' | 'caution' | 'warning' {
    const statusMap: Record<string, 'normal' | 'caution' | 'warning'> = {
      'normal': 'normal',
      'caution': 'caution',
      'warning': 'warning',
      '양호': 'normal',
      '주의': 'caution',
      '경고': 'warning',
    };
    return statusMap[status] || 'normal';
  }

  private getBloodFlowText(level: number): string {
    const textMap: Record<number, string> = {
      1: '매우 적음',
      2: '적음',
      3: '보통',
      4: '많음',
      5: '매우 많음',
    };
    return textMap[level] || '보통';
  }
}

export const analysisAPI = new AnalysisAPI();
```

### 3.2 API 엔드포인트 정의

```typescript
/**
 * GET /api/v1/analysis/{analysisId}
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "uuid",
 *     "userId": "uuid",
 *     "timestamp": "2025-11-28T15:24:00Z",
 *     "imageUrl": "https://...",
 *     "overallStatus": "normal",
 *     "bloodFlow": {
 *       "level": 3,
 *       "comment": "이번 주기 평균과 비슷해요",
 *       "comparisonTrend": "similar"
 *     },
 *     "color": {
 *       "status": "normal",
 *       "colorCode": "#8C4A4A",
 *       "text": "정상 범위",
 *       "comment": "건강한 색상입니다"
 *     },
 *     "aiComment": "정상적인 월경 상태입니다. 규칙적인 주기를 유지하고 있어요.",
 *     "warning": null
 *   }
 * }
 */

/**
 * POST /api/v1/health/record
 *
 * Request:
 * {
 *   "analysisId": "uuid",
 *   "date": "2025-11-28T15:24:00Z",
 *   "notes": "오늘 컨디션이 좋았어요",
 *   "tags": ["생리통", "가벼움"]
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "recordId": "uuid",
 *     "savedAt": "2025-11-28T15:30:00Z"
 *   }
 * }
 */
```

---

## 4. Navigation 흐름

### 4.1 Navigation Types

```typescript
// types/navigation.types.ts

export type RootStackParamList = {
  // ... other routes
  AnalysisResult: { analysisId: string };
  AnalysisDetail: { analysisId: string };
  ConsultationMain: undefined;
  Home: undefined;
};
```

### 4.2 Navigation Handlers

```typescript
// AnalysisResultScreen.tsx

const handleBack = useCallback(() => {
  navigation.goBack();
  analytics.logEvent('analysis_result_back_pressed');
}, [navigation]);

const handleMenu = useCallback(() => {
  // 메뉴 바텀시트 표시
  setMenuVisible(true);
}, []);

const handleSave = useCallback(async () => {
  if (!data) return;

  try {
    await saveRecordAsync({
      analysisId: data.id,
      date: new Date().toISOString(),
      notes: '',
      tags: [],
    });

    showToast('기록이 저장되었습니다', 'success');
    analytics.logEvent('analysis_record_saved', { analysisId: data.id });

    // 홈으로 이동
    navigation.navigate('Home');
  } catch (error) {
    showToast('저장에 실패했습니다', 'error');
  }
}, [data, saveRecordAsync, navigation]);

const handleDetailView = useCallback(() => {
  if (!data) return;

  navigation.navigate('AnalysisDetail', {
    analysisId: data.id,
  });
  analytics.logEvent('analysis_detail_pressed', { analysisId: data.id });
}, [data, navigation]);

const handleConsultationBooking = useCallback(() => {
  navigation.navigate('ConsultationMain');
  analytics.logEvent('analysis_consultation_pressed');
}, [navigation]);

const handleRetry = useCallback(() => {
  refetch();
}, [refetch]);
```

---

## 5. 로딩/오류 처리

### 5.1 로딩 상태

```typescript
// AnalysisResultScreen.tsx

if (loading && !data) {
  return <LoadingView message="분석 결과를 불러오는 중..." />;
}
```

### 5.2 에러 상태

```typescript
// AnalysisResultScreen.tsx

if (error && !data) {
  return (
    <ErrorView
      error={error}
      onRetry={handleRetry}
      message="분석 결과를 불러오는데 실패했습니다"
    />
  );
}
```

### 5.3 저장 중 상태

```typescript
// BottomActions 컴포넌트에서

<FMButton
  variant="primary"
  text="기록 저장"
  onPress={handleSave}
  loading={saving}
  disabled={saving}
/>
```

### 5.4 네트워크 에러 처리

```typescript
// services/api/analysisAPI.ts

try {
  const response = await axiosInstance.get(`/analysis/${analysisId}`);
  return response.data.data;
} catch (error: any) {
  if (error.code === 'ECONNABORTED') {
    throw new Error('요청 시간이 초과되었습니다. 다시 시도해주세요.');
  }

  if (error.response?.status === 404) {
    throw new Error('분석 결과를 찾을 수 없습니다.');
  }

  if (error.response?.status === 403) {
    throw new Error('접근 권한이 없습니다.');
  }

  throw new Error('분석 결과를 불러오는데 실패했습니다.');
}
```

---

## 6. Validation 규칙

### 6.1 데이터 검증 유틸리티

```typescript
// utils/validation/analysisValidation.ts

import type { AnalysisData, BloodFlowAnalysis, ColorAnalysis } from '@/types/analysis.types';

/**
 * 분석 ID 유효성 검증
 */
export const validateAnalysisId = (id: string): boolean => {
  return typeof id === 'string' && id.length > 0;
};

/**
 * 출혈량 레벨 검증
 */
export const validateBloodFlowLevel = (level: number): boolean => {
  return Number.isInteger(level) && level >= 1 && level <= 5;
};

/**
 * 상태 값 검증
 */
export const validateStatus = (
  status: string
): status is 'normal' | 'caution' | 'warning' => {
  return ['normal', 'caution', 'warning'].includes(status);
};

/**
 * 색상 코드 검증
 */
export const validateColorCode = (colorCode: string): boolean => {
  const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
  return hexColorRegex.test(colorCode);
};

/**
 * 타임스탬프 검증
 */
export const validateTimestamp = (timestamp: string): boolean => {
  const date = new Date(timestamp);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * 출혈량 분석 데이터 검증
 */
export const validateBloodFlowAnalysis = (
  bloodFlow: BloodFlowAnalysis
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!validateBloodFlowLevel(bloodFlow.level)) {
    errors.push('출혈량 레벨이 유효하지 않습니다 (1-5)');
  }

  if (!bloodFlow.text || bloodFlow.text.trim().length === 0) {
    errors.push('출혈량 텍스트가 비어있습니다');
  }

  if (!bloodFlow.comment || bloodFlow.comment.trim().length === 0) {
    errors.push('출혈량 코멘트가 비어있습니다');
  }

  if (!['similar', 'higher', 'lower'].includes(bloodFlow.comparisonTrend)) {
    errors.push('비교 트렌드가 유효하지 않습니다');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 색상 분석 데이터 검증
 */
export const validateColorAnalysis = (
  color: ColorAnalysis
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!validateStatus(color.status)) {
    errors.push('색상 상태가 유효하지 않습니다');
  }

  if (!validateColorCode(color.colorCode)) {
    errors.push('색상 코드가 유효하지 않습니다');
  }

  if (!color.text || color.text.trim().length === 0) {
    errors.push('색상 텍스트가 비어있습니다');
  }

  if (!color.comment || color.comment.trim().length === 0) {
    errors.push('색상 코멘트가 비어있습니다');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 전체 분석 데이터 검증
 */
export const validateAnalysisData = (
  data: AnalysisData
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!validateAnalysisId(data.id)) {
    errors.push('분석 ID가 유효하지 않습니다');
  }

  if (!validateTimestamp(data.timestamp)) {
    errors.push('타임스탬프가 유효하지 않습니다');
  }

  if (!validateStatus(data.overallStatus)) {
    errors.push('전체 상태가 유효하지 않습니다');
  }

  // 출혈량 검증
  const bloodFlowValidation = validateBloodFlowAnalysis(data.bloodFlow);
  if (!bloodFlowValidation.isValid) {
    errors.push(...bloodFlowValidation.errors);
  }

  // 색상 검증
  const colorValidation = validateColorAnalysis(data.color);
  if (!colorValidation.isValid) {
    errors.push(...colorValidation.errors);
  }

  // AI 코멘트 검증
  if (!data.aiComment || data.aiComment.trim().length === 0) {
    errors.push('AI 코멘트가 비어있습니다');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
```

### 6.2 런타임 검증

```typescript
// services/hooks/useAnalysisData.ts (수정)

export const useAnalysisData = (analysisId: string) => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<AnalysisData, Error>({
    queryKey: ['analysisData', analysisId],
    queryFn: () => analysisAPI.getAnalysisResult(analysisId),
    select: (data) => {
      // 데이터 검증
      const validation = validateAnalysisData(data);
      if (!validation.isValid) {
        console.warn('[Validation] Analysis data validation failed:', validation.errors);
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

### 7.1 AnalysisResultScreen 스타일

```typescript
// screens/analysis/AnalysisResultScreen.styles.ts

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
    paddingBottom: Spacing.xxl + 80, // BottomActions 높이 고려
  },
});
```

### 7.2 AnalysisStatusCard 스타일

```typescript
// components/organisms/AnalysisStatusCard.styles.ts

import { StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Shadows } from '@/styles/tokens';

export const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },

  card: {
    borderRadius: BorderRadius.xlarge,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.large,
  },

  iconContainer: {
    marginBottom: Spacing.md,
  },

  statusText: {
    fontFamily: 'Pretendard',
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textWhite,
    marginBottom: Spacing.sm,
  },

  timestampText: {
    fontFamily: 'Pretendard',
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
```

### 7.3 LinearGradient 사용 (상태별)

```typescript
// components/organisms/AnalysisStatusCard.tsx

import React from 'react';
import { View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { StatusIcon } from '@/components/atoms/StatusIcon';
import { FMText } from '@/components/atoms/FMText';
import { formatTimestamp } from '@/utils/formatters/analysisFormatter';
import { styles } from './AnalysisStatusCard.styles';

interface AnalysisStatusCardProps {
  status: 'normal' | 'caution' | 'warning';
  statusText: string;
  timestamp: string;
}

// 상태별 그라데이션 색상
const GRADIENT_COLORS = {
  normal: ['#F7C8C0', '#F5A97F'], // Coral Pink → Warm Orange
  caution: ['#F5A97F', '#F7C8C0'], // Warm Orange → Coral Pink
  warning: ['#E89B9B', '#F5A97F'], // Error Red → Warm Orange
};

const STATUS_TEXT_MAP = {
  normal: '양호',
  caution: '주의',
  warning: '경고',
};

export const AnalysisStatusCard: React.FC<AnalysisStatusCardProps> = ({
  status,
  statusText,
  timestamp,
}) => {
  const gradientColors = GRADIENT_COLORS[status];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.iconContainer}>
          <StatusIcon status={status} size={64} color="#FFFFFF" />
        </View>

        <FMText style={styles.statusText}>
          {STATUS_TEXT_MAP[status]}
        </FMText>

        <FMText style={styles.statusText}>
          {statusText}
        </FMText>

        <FMText style={styles.timestampText}>
          {formatTimestamp(timestamp)}
        </FMText>
      </LinearGradient>
    </View>
  );
};
```

### 7.4 BloodFlowIndicator 스타일

```typescript
// components/molecules/BloodFlowIndicator.styles.ts

import { StyleSheet } from 'react-native';
import { Colors, Spacing } from '@/styles/tokens';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },

  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },

  levelText: {
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});
```

```typescript
// components/atoms/LevelDot.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/styles/tokens';

interface LevelDotProps {
  filled: boolean;
  active?: boolean;
  size?: number;
}

export const LevelDot: React.FC<LevelDotProps> = ({
  filled,
  active = false,
  size = 16,
}) => {
  return (
    <View
      style={[
        styles.dot,
        { width: size, height: size, borderRadius: size / 2 },
        filled && styles.filled,
        active && styles.active,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  dot: {
    backgroundColor: '#E5E5E5', // Empty
  },
  filled: {
    backgroundColor: Colors.primary, // #F7C8C0
  },
  active: {
    backgroundColor: Colors.primaryDark, // #F5A97F
  },
});
```

### 7.5 Section 스타일

```typescript
// components/organisms/BloodFlowSection.styles.ts

import { StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Shadows } from '@/styles/tokens';

export const styles = StyleSheet.create({
  section: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xlarge,
    padding: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },

  sectionTitle: {
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },

  comment: {
    fontFamily: 'Pretendard',
    fontSize: 14,
    fontWeight: '400',
    color: Colors.textSecondary,
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

  comparisonText: {
    fontFamily: 'Pretendard',
    fontSize: 12,
    fontWeight: '500',
    color: Colors.primary,
  },
});
```

### 7.6 WarningBox 스타일

```typescript
// components/organisms/WarningBox.styles.ts

import { StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/styles/tokens';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF5F5', // 연한 빨강 배경
    borderWidth: 1,
    borderColor: '#FFE0E0',
    borderRadius: BorderRadius.xlarge,
    padding: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },

  icon: {
    marginRight: Spacing.sm,
  },

  title: {
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
  },

  message: {
    fontFamily: 'Pretendard',
    fontSize: 14,
    fontWeight: '400',
    color: Colors.textSecondary,
    lineHeight: 22.4,
    marginBottom: Spacing.md,
  },

  actionButton: {
    marginTop: Spacing.sm,
  },
});
```

### 7.7 BottomActions 스타일

```typescript
// components/organisms/BottomActions.styles.ts

import { StyleSheet } from 'react-native';
import { Colors, Spacing } from '@/styles/tokens';

export const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },

  button: {
    flex: 1,
  },
});
```

---

## 8. 비동기 처리 순서

### 8.1 초기 로딩 플로우

```typescript
/**
 * 분석 결과 화면 초기 로딩 시퀀스
 *
 * 1. 컴포넌트 마운트
 *    - route params에서 analysisId 추출
 *    - useAnalysisData(analysisId) 훅 초기화
 *    - React Query가 캐시 확인
 *
 * 2. 캐시 없음 → API 요청 시작
 *    - loading: true
 *    - fetchAnalysisResult(analysisId) 실행
 *
 * 3. API 요청
 *    - GET /api/v1/analysis/{analysisId}
 *    - 평균 응답 시간: ~500ms
 *
 * 4. 응답 데이터 매핑
 *    - mapAnalysisResponse()
 *    - 상태 문자열 변환
 *    - 출혈량 레벨 → 텍스트 매핑
 *
 * 5. 데이터 검증
 *    - validateAnalysisData()
 *    - 검증 실패 시 콘솔 경고
 *
 * 6. 상태 업데이트
 *    - loading: false
 *    - data: AnalysisData
 *
 * 7. UI 렌더링
 *    - 모든 섹션 순차적으로 렌더링
 *    - 조건부 WarningBox 렌더링
 *
 * 총 소요 시간: ~600ms (네트워크 양호 시)
 */
```

### 8.2 기록 저장 플로우

```typescript
/**
 * 기록 저장 버튼 클릭 시퀀스
 *
 * 1. 사용자가 "기록 저장" 버튼 클릭
 *    - handleSave() 트리거
 *
 * 2. 데이터 존재 확인
 *    - if (!data) return
 *
 * 3. saving 상태 업데이트
 *    - saving: true
 *    - 버튼 disabled + loading 표시
 *
 * 4. API 요청
 *    - POST /api/v1/health/record
 *    - Request Body: { analysisId, date, notes, tags }
 *
 * 5. 성공 시
 *    5-1. saving: false
 *    5-2. React Query 캐시 무효화
 *         - ['homeData'] 무효화 (최근 분석 업데이트)
 *         - ['healthRecords'] 무효화
 *    5-3. Toast 메시지 표시
 *         - "기록이 저장되었습니다"
 *    5-4. Analytics 이벤트
 *         - 'analysis_record_saved'
 *    5-5. 홈으로 이동
 *         - navigation.navigate('Home')
 *
 * 6. 실패 시
 *    6-1. saving: false
 *    6-2. Toast 에러 메시지
 *         - "저장에 실패했습니다"
 *    6-3. 화면 유지
 *
 * 총 소요 시간: ~800ms
 */
```

### 8.3 재시도 플로우

```typescript
/**
 * 에러 발생 시 재시도 로직
 *
 * 1. API 요청 실패
 *    - 네트워크 에러
 *    - 서버 에러 (5xx)
 *    - 404 Not Found
 *
 * 2. React Query 자동 재시도
 *    - retry: 2
 *    - 1차 재시도: 1초 후
 *    - 2차 재시도: 2초 후
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

### 9.1 AnalysisResultScreen 전체 코드

```typescript
// screens/analysis/AnalysisResultScreen.tsx

import React, { useCallback, useEffect } from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Components
import { NavBar } from '@/components/molecules/NavBar';
import { AnalysisStatusCard } from '@/components/organisms/AnalysisStatusCard';
import { BloodFlowSection } from '@/components/organisms/BloodFlowSection';
import { ColorAnalysisSection } from '@/components/organisms/ColorAnalysisSection';
import { AICommentBox } from '@/components/organisms/AICommentBox';
import { WarningBox } from '@/components/organisms/WarningBox';
import { BottomActions } from '@/components/organisms/BottomActions';
import { LoadingView } from '@/components/molecules/LoadingView';
import { ErrorView } from '@/components/molecules/ErrorView';

// Hooks
import { useAnalysisData } from '@/services/hooks/useAnalysisData';
import { useAnalysisSave } from '@/services/hooks/useAnalysisSave';

// Utils
import { analytics } from '@/utils/analytics';
import { showToast } from '@/utils/toast';

// Types
import type { RootStackParamList } from '@/types/navigation.types';

// Styles
import { styles } from './AnalysisResultScreen.styles';

type AnalysisResultScreenRouteProp = RouteProp<RootStackParamList, 'AnalysisResult'>;
type AnalysisResultScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AnalysisResultScreen: React.FC = () => {
  // ===== Navigation & Route =====
  const route = useRoute<AnalysisResultScreenRouteProp>();
  const navigation = useNavigation<AnalysisResultScreenNavigationProp>();
  const { analysisId } = route.params;

  // ===== Hooks =====
  const { data, loading, error, refetch } = useAnalysisData(analysisId);
  const { saveRecordAsync, saving } = useAnalysisSave();

  // ===== Analytics =====
  useEffect(() => {
    analytics.logScreenView('analysis_result', { analysisId });
  }, [analysisId]);

  // ===== Event Handlers =====
  const handleBack = useCallback(() => {
    navigation.goBack();
    analytics.logEvent('analysis_result_back_pressed');
  }, [navigation]);

  const handleMenu = useCallback(() => {
    // TODO: 메뉴 바텀시트 표시
    analytics.logEvent('analysis_result_menu_pressed');
  }, []);

  const handleSave = useCallback(async () => {
    if (!data) return;

    try {
      await saveRecordAsync({
        analysisId: data.id,
        date: new Date().toISOString(),
        notes: '',
        tags: [],
      });

      showToast('기록이 저장되었습니다', 'success');
      analytics.logEvent('analysis_record_saved', { analysisId: data.id });

      // 홈으로 이동
      navigation.navigate('Home');
    } catch (error) {
      console.error('[AnalysisResultScreen] Save failed:', error);
      showToast('저장에 실패했습니다', 'error');
    }
  }, [data, saveRecordAsync, navigation]);

  const handleDetailView = useCallback(() => {
    if (!data) return;

    navigation.navigate('AnalysisDetail', {
      analysisId: data.id,
    });
    analytics.logEvent('analysis_detail_pressed', { analysisId: data.id });
  }, [data, navigation]);

  const handleConsultationBooking = useCallback(() => {
    navigation.navigate('ConsultationMain');
    analytics.logEvent('analysis_consultation_pressed');
  }, [navigation]);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // ===== Render Loading =====
  if (loading && !data) {
    return <LoadingView message="분석 결과를 불러오는 중..." />;
  }

  // ===== Render Error =====
  if (error && !data) {
    return (
      <ErrorView
        error={error}
        onRetry={handleRetry}
        message="분석 결과를 불러오는데 실패했습니다"
      />
    );
  }

  // ===== Data Guard =====
  if (!data) {
    return null;
  }

  // ===== Render Main UI =====
  return (
    <SafeAreaView style={styles.container}>
      {/* NavBar */}
      <NavBar
        title="분석 결과"
        onBackPress={handleBack}
        onMenuPress={handleMenu}
      />

      {/* ScrollView */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 전체 상태 카드 */}
        <AnalysisStatusCard
          status={data.overallStatus}
          statusText={getStatusText(data.overallStatus)}
          timestamp={data.timestamp}
        />

        {/* 출혈량 분석 */}
        <BloodFlowSection
          level={data.bloodFlow.level}
          text={data.bloodFlow.text}
          comment={data.bloodFlow.comment}
          comparisonTrend={data.bloodFlow.comparisonTrend}
        />

        {/* 색상 분석 */}
        <ColorAnalysisSection
          status={data.color.status}
          colorCode={data.color.colorCode}
          text={data.color.text}
          comment={data.color.comment}
        />

        {/* AI 코멘트 */}
        <AICommentBox
          comment={data.aiComment}
        />

        {/* 주의사항 (조건부) */}
        {data.warning && (
          <WarningBox
            title={data.warning.title}
            message={data.warning.message}
            severity={data.warning.severity}
            actionText={data.warning.actionText}
            onActionPress={
              data.warning.actionRequired
                ? handleConsultationBooking
                : undefined
            }
          />
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <BottomActions
        onDetailPress={handleDetailView}
        onSavePress={handleSave}
        saving={saving}
      />
    </SafeAreaView>
  );
};

// Helper functions
const getStatusText = (status: 'normal' | 'caution' | 'warning'): string => {
  const textMap = {
    normal: '전반적으로 정상입니다',
    caution: '일부 주의가 필요합니다',
    warning: '확인이 필요합니다',
  };
  return textMap[status];
};
```

### 9.2 생명주기 다이어그램

```typescript
/**
 * AnalysisResultScreen 생명주기
 *
 * ┌─────────────────────────────────────────────────────┐
 * │ 1. Component Mount                                  │
 * │    - route.params에서 analysisId 추출              │
 * │    - useAnalysisData(analysisId) 훅 초기화         │
 * │    - React Query 캐시 확인                          │
 * │    - Analytics 화면 뷰 기록                         │
 * └─────────────────┬───────────────────────────────────┘
 *                   │
 *                   ▼
 * ┌─────────────────────────────────────────────────────┐
 * │ 2. Initial Data Fetch (캐시 없을 시)                │
 * │    - loading: true                                  │
 * │    - API 요청 시작                                  │
 * │    - LoadingView 렌더링                             │
 * └─────────────────┬───────────────────────────────────┘
 *                   │
 *                   ▼
 * ┌─────────────────────────────────────────────────────┐
 * │ 3. Data Received                                    │
 * │    - 응답 데이터 매핑                               │
 * │    - 데이터 검증                                    │
 * │    - loading: false                                 │
 * │    - data 상태 업데이트                             │
 * └─────────────────┬───────────────────────────────────┘
 *                   │
 *                   ▼
 * ┌─────────────────────────────────────────────────────┐
 * │ 4. Main UI Render                                   │
 * │    - NavBar 렌더링                                  │
 * │    - StatusCard 렌더링                              │
 * │    - BloodFlowSection 렌더링                        │
 * │    - ColorAnalysisSection 렌더링                    │
 * │    - AICommentBox 렌더링                            │
 * │    - WarningBox 조건부 렌더링                       │
 * │    - BottomActions 렌더링                           │
 * └─────────────────┬───────────────────────────────────┘
 *                   │
 *       ┌───────────┴───────────┐
 *       │                       │
 *       ▼                       ▼
 * ┌─────────────┐     ┌──────────────────┐
 * │ 5a. 상세     │     │ 5b. 기록 저장    │
 * │     보기     │     │                  │
 * │  - navigate  │     │  - saveRecord()  │
 * │    Detail    │     │  - saving: true  │
 * │              │     │  - API POST      │
 * └──────────────┘     └────────┬─────────┘
 *                               │
 *                               ▼
 *                     ┌──────────────────┐
 *                     │ 6. 저장 완료     │
 *                     │  - Toast 표시    │
 *                     │  - 캐시 무효화   │
 *                     │  - navigate Home │
 *                     └──────────────────┘
 *
 *     ┌─────────────────────────────────────┐
 *     │ 7. Component Unmount                │
 *     │    - Cleanup                        │
 *     │    - Analytics 이벤트 종료          │
 *     └─────────────────────────────────────┘
 */
```

---

## 10. 주요 컴포넌트 구현

### 10.1 BloodFlowSection

```typescript
// components/organisms/BloodFlowSection.tsx

import React from 'react';
import { View } from 'react-native';
import { FMText } from '@/components/atoms/FMText';
import { BloodFlowIndicator } from '@/components/molecules/BloodFlowIndicator';
import { ComparisonBadge } from '@/components/molecules/ComparisonBadge';
import { styles } from './BloodFlowSection.styles';

interface BloodFlowSectionProps {
  level: number;
  text: string;
  comment: string;
  comparisonTrend: 'similar' | 'higher' | 'lower';
}

export const BloodFlowSection: React.FC<BloodFlowSectionProps> = ({
  level,
  text,
  comment,
  comparisonTrend,
}) => {
  const getTrendText = () => {
    const trendMap = {
      similar: '이번 주기 평균과 비슷해요',
      higher: '이번 주기 평균보다 많아요',
      lower: '이번 주기 평균보다 적어요',
    };
    return trendMap[comparisonTrend];
  };

  return (
    <View style={styles.section}>
      <FMText style={styles.sectionTitle}>출혈량</FMText>

      <BloodFlowIndicator level={level} text={text} maxLevel={5} />

      <FMText style={styles.comment}>{comment}</FMText>

      <ComparisonBadge text={getTrendText()} trend={comparisonTrend} />
    </View>
  );
};
```

### 10.2 ColorAnalysisSection

```typescript
// components/organisms/ColorAnalysisSection.tsx

import React from 'react';
import { View } from 'react-native';
import { FMText } from '@/components/atoms/FMText';
import { ColorIndicator } from '@/components/atoms/ColorIndicator';
import { styles } from './ColorAnalysisSection.styles';

interface ColorAnalysisSectionProps {
  status: 'normal' | 'caution' | 'warning';
  colorCode: string;
  text: string;
  comment: string;
}

export const ColorAnalysisSection: React.FC<ColorAnalysisSectionProps> = ({
  status,
  colorCode,
  text,
  comment,
}) => {
  return (
    <View style={styles.section}>
      <FMText style={styles.sectionTitle}>색상</FMText>

      <View style={styles.colorContainer}>
        <ColorIndicator color={colorCode} size={48} />
        <FMText style={styles.colorText}>{text}</FMText>
      </View>

      <FMText style={styles.comment}>{comment}</FMText>
    </View>
  );
};
```

### 10.3 AICommentBox

```typescript
// components/organisms/AICommentBox.tsx

import React from 'react';
import { View } from 'react-native';
import { FMText } from '@/components/atoms/FMText';
import { FMIcon } from '@/components/atoms/FMIcon';
import { styles } from './AICommentBox.styles';

interface AICommentBoxProps {
  comment: string;
}

export const AICommentBox: React.FC<AICommentBoxProps> = ({ comment }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FMIcon name="lightbulb" size={24} color="#F7C8C0" />
        <FMText style={styles.title}>AI 건강 코멘트</FMText>
      </View>

      <FMText style={styles.message}>{comment}</FMText>
    </View>
  );
};
```

### 10.4 BottomActions

```typescript
// components/organisms/BottomActions.tsx

import React from 'react';
import { View } from 'react-native';
import { FMButton } from '@/components/atoms/FMButton';
import { styles } from './BottomActions.styles';

interface BottomActionsProps {
  onDetailPress: () => void;
  onSavePress: () => void;
  saving: boolean;
}

export const BottomActions: React.FC<BottomActionsProps> = ({
  onDetailPress,
  onSavePress,
  saving,
}) => {
  return (
    <View style={styles.container}>
      <FMButton
        variant="outline"
        text="상세 분석 보기"
        onPress={onDetailPress}
        style={styles.button}
        disabled={saving}
      />

      <FMButton
        variant="primary"
        text="기록 저장"
        onPress={onSavePress}
        style={styles.button}
        loading={saving}
        disabled={saving}
      />
    </View>
  );
};
```

---

## 11. 포매터 유틸리티

```typescript
// utils/formatters/analysisFormatter.ts

import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 타임스탬프 포맷팅
 * "2025.11.28 오후 3:24"
 */
export const formatTimestamp = (timestamp: string): string => {
  try {
    const date = parseISO(timestamp);
    return format(date, 'yyyy.MM.dd a h:mm', { locale: ko });
  } catch (error) {
    console.error('[Formatter] formatTimestamp failed:', error);
    return timestamp;
  }
};

/**
 * 날짜만 포맷팅
 * "2025년 11월 28일"
 */
export const formatDate = (timestamp: string): string => {
  try {
    const date = parseISO(timestamp);
    return format(date, 'yyyy년 MM월 dd일', { locale: ko });
  } catch (error) {
    console.error('[Formatter] formatDate failed:', error);
    return timestamp;
  }
};

/**
 * 시간만 포맷팅
 * "오후 3:24"
 */
export const formatTime = (timestamp: string): string => {
  try {
    const date = parseISO(timestamp);
    return format(date, 'a h:mm', { locale: ko });
  } catch (error) {
    console.error('[Formatter] formatTime failed:', error);
    return timestamp;
  }
};
```

---

이 문서는 FemCare AI 분석 결과 화면의 완전한 React Native 구현 명세서입니다.
