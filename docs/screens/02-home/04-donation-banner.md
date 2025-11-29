# FemCare 기부 배너 화면

## 1. 화면 목적
홈 화면 내 기부 활동 표시 및 참여 유도

## 2-4. UI 구성
```
┌─────────────────────────────┐
│  💝 함께 만드는 변화         │
│                             │
│  이번 달 기부 적립금         │
│  1,250원                    │
│  ━━━━━━━━━━ 50%             │
│                             │
│  234명이 함께하고 있어요     │
│                             │
│  기부하기 | 자세히 보기      │
└─────────────────────────────┘
```

## 5. UI 컴포넌트
```jsx
<DonationBanner>
  <Header>
    <Icon>💝</Icon>
    <Title>함께 만드는 변화</Title>
  </Header>
  <DonationAmount>
    <Current>{amount}원</Current>
    <Progress value={percentage} />
  </DonationAmount>
  <Participants>{count}명이 함께하고 있어요</Participants>
  <Actions>
    <TextButton>기부하기</TextButton>
    <TextButton>자세히 보기</TextButton>
  </Actions>
</DonationBanner>
```

## 6. 기능 로직
- 월별 적립금 계산 (구독액 1%)
- 참여자 수 표시
- 기부 → 기부 메인 화면
- 자세히 보기 → 기부 캠페인 상세

## 7. Validation
- 구독 없을 시: 기부 안내 메시지

## 8. API
### GET /api/v1/donation/monthly-summary
월별 기부 요약

## 9. 스타일
```css
.donation-banner {
  background: linear-gradient(135deg, rgba(247, 200, 192, 0.2), rgba(245, 238, 232, 0.5));
  border-radius: 22px;
  padding: 24px;
}
```
