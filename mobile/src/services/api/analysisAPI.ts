import axiosInstance from './axiosConfig';
import type { AnalysisData } from '@/types/analysis.types';

class AnalysisAPI {
  /**
   * 분석 결과 조회
   */
  async getAnalysisResult(analysisId: string): Promise<AnalysisData> {
    try {
      const response = await axiosInstance.get(`/analysis/${analysisId}`);
      return response.data;
    } catch (error) {
      console.error('[AnalysisAPI] getAnalysisResult failed:', error);
      throw error;
    }
  }

  /**
   * 분석 결과 저장
   */
  async saveAnalysis(analysisId: string): Promise<void> {
    try {
      await axiosInstance.post(`/analysis/${analysisId}/save`);
    } catch (error) {
      console.error('[AnalysisAPI] saveAnalysis failed:', error);
      throw error;
    }
  }

  /**
   * 최근 분석 조회
   */
  async getRecentAnalysis(): Promise<AnalysisData | null> {
    try {
      const response = await axiosInstance.get('/analysis', {
        params: { limit: 1 },
      });
      const items = response.data.items;
      return items.length > 0 ? items[0] : null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
}

export const analysisAPI = new AnalysisAPI();
