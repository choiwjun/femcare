# FemCare AI 분석 CTA 화면

## 1. 화면 목적
홈 화면 내 AI 분석 촉진 섹션으로, 사용자에게 정기적인 건강 체크 유도

## 2-4. UI 구성
### 상단: 홈 화면 내 섹션 (별도 네비게이션 바 없음)
### 중단: CTA 카드
```
┌─────────────────────────────┐
│  📸 건강 체크 시간이에요     │
│                             │
│  마지막 분석: 3일 전         │
│                             │
│  [  AI 분석 시작하기  ]      │
└─────────────────────────────┘
```
### 하단: 이전 분석 요약 (3개)

## 5. UI 컴포넌트 구조
```jsx
<AIAnalysisCTA>
  <CTACard gradient>
    <Icon>📸</Icon>
    <Title>건강 체크 시간이에요</Title>
    <LastAnalysis>마지막 분석: {days}일 전</LastAnalysis>
    <PrimaryButton text="AI 분석 시작하기" />
  </CTACard>
  <HistoryList>
    {recentAnalyses.map(item => (
      <HistoryItem data={item} />
    ))}
  </HistoryList>
</AIAnalysisCTA>
```

## 6. 기능 로직
- 마지막 분석일 체크
- 3일 이상 경과 시 알림 표시
- CTA 클릭 → 촬영 가이드 화면

## 7. Validation
- 분석 없음: "첫 AI 분석을 시작해보세요"
- 당일 분석 완료: "오늘 분석을 완료했어요"

## 8. API
### GET /api/v1/analysis/last
마지막 분석 정보

## 9. 스타일
```css
.cta-card {
  background: linear-gradient(135deg, #F7C8C0, #F5A97F);
  border-radius: 22px;
  padding: 24px;
  color: #FFFFFF;
}
```
