# FemCare 알림 설정 화면

## 1. 화면 목적
푸시 알림 및 이메일 알림 설정

## 2-4. UI
### 푸시 알림
```
전체 알림
[ON/OFF 토글]

생리 예정일 알림
[ON] 3일 전

배란일 알림
[ON] 1일 전

건강 체크 알림
[ON] 3일마다

구독 배송 알림
[ON] 배송 시작 시

상담 알림
[ON] 답변 도착 시
```

### 이메일 알림
```
주간 건강 리포트
[ON] 매주 월요일

마케팅 정보
[OFF]
```

### 방해금지 시간
```
[ON] 22:00 ~ 08:00
```

## 5-9.
- API: GET /api/v1/user/notification-settings
- API: PUT /api/v1/user/notification-settings
