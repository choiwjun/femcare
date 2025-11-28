# FemCare 게시글 상세 화면

## 1. 화면 목적
게시글 내용 및 댓글

## 2-4. UI
### 게시글
```
생리통 완화 방법

[내용]
생리통이 너무 심해서 일상생활이
힘들어요. 혹시 좋은 방법 있을까요?

👍 12  💬 5  👁 234
3시간 전 • 익명
```

### 댓글
```
💬 5개의 댓글

따뜻한 물주머니를 배에 대면 좋아요
👍 5  2시간 전

저는 요가가 도움이 됐어요
👍 3  1시간 전
```

### 댓글 입력
```
[댓글을 입력하세요...]
```

## 5-9.
- API: GET /api/v1/community/posts/{id}
- API: POST /api/v1/community/comments
- API: POST /api/v1/community/posts/{id}/like
