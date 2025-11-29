# FemCare 텍스트 상담 채팅 화면

## 1. 화면 목적
실시간 텍스트 채팅 상담

## 2-4. UI
### 헤더
```
←  김지은 상담사  ⋯
    온라인
```

### 채팅 영역
```
[상담사] 안녕하세요. 무엇을 도와드릴까요?
         14:20

[나]    생리통이 심해서요...
         14:22

[상담사] 언제부터 증상이 있으셨나요?
         14:23
```

### 입력창
```
[+] [메시지 입력...] [전송]
```

### 첨부
- 이미지 첨부 가능
- 분석 결과 공유 가능

## 5-9.
- API: WebSocket /ws/consultation/{id}
- API: POST /api/v1/consultation/messages
- 이미지 업로드: POST /api/v1/consultation/attachments
