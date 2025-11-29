# FemCare 구독 현황 화면

## 1. 화면 목적
홈 화면 내 구독 상태 표시 및 빠른 관리

## 2-4. UI 구성
### 구독 중
```
┌─────────────────────────────┐
│  📦 다음 배송                │
│                             │
│  12월 20일 도착 예정         │
│  순면 중형 패드 × 3          │
│                             │
│  배송 조회 | 구독 관리       │
└─────────────────────────────┘
```

### 비구독
```
┌─────────────────────────────┐
│  📦 정기구독으로 편리하게     │
│                             │
│  첫 달 10% 할인 + 무료배송   │
│                             │
│  [  구독 시작하기  ]         │
└─────────────────────────────┘
```

## 5. UI 컴포넌트
```jsx
{hasSubscription ? (
  <SubscriptionActive>
    <DeliveryInfo />
    <ActionButtons />
  </SubscriptionActive>
) : (
  <SubscriptionCTA>
    <Benefits />
    <CTAButton />
  </SubscriptionCTA>
)}
```

## 6. 기능 로직
- 구독 상태 확인
- 다음 배송일 계산
- 배송 조회/관리 링크

## 7. Validation
- 구독 상태 실시간 동기화

## 8. API
### GET /api/v1/subscription/status
구독 상태 및 다음 배송 정보

## 9. 스타일
```css
.subscription-card {
  background: #FFFFFF;
  border: 1px solid #F5EEE8;
  border-radius: 22px;
  padding: 20px;
}
```
