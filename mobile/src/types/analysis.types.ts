export type AnalysisStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type OverallStatus = 'NORMAL' | 'CAUTION' | 'WARNING';
export type ComparisonTrend = 'SIMILAR' | 'HIGHER' | 'LOWER';
export type WarningSeverity = 'CAUTION' | 'WARNING';

export interface BloodFlowAnalysis {
  level: number; // 1-5
  text: string;
  confidence: number;
  comment: string;
  comparisonTrend?: ComparisonTrend;
  averageLevel?: number;
}

export interface ColorAnalysis {
  status: OverallStatus;
  colorCode: string;
  text: string;
  rgb: {
    r: number;
    g: number;
    b: number;
  };
  confidence: number;
  comment: string;
}

export interface WarningInfo {
  title: string;
  message: string;
  severity: WarningSeverity;
  actionRequired: boolean;
  actionText?: string;
}

export interface AnalysisMetadata {
  modelVersion: string;
  processingTime: number;
  imageQuality: string;
  imageSize: number;
  aiRequestId?: string;
}

export interface AnalysisData {
  id: string;
  userId: string;
  imageUrl: string;
  thumbnailUrl: string;
  analysisDate: string; // ISO 8601
  status: AnalysisStatus;
  overallStatus?: OverallStatus;
  bloodFlowAnalysis?: BloodFlowAnalysis;
  colorAnalysis?: ColorAnalysis;
  aiComment?: string;
  warning?: WarningInfo;
  metadata?: AnalysisMetadata;
  notes?: string;
  symptoms?: string[];
  saved: boolean;
  createdAt: string;
  updatedAt: string;
}
