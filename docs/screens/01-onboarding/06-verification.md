# FemCare 본인인증 화면

## 1. 화면 목적
- 휴대폰 번호로 본인 인증
- 회원가입 보안 강화
- SMS 인증 코드 확인

## 2. 상단 UI 구성

### 네비게이션 바
```
┌─────────────────────────────┐
│  ←      본인인증            │
└─────────────────────────────┘
```
- **제목**: "본인인증"
- **좌측**: 뒤로가기 버튼

## 3. 중단 UI 구성

### 진행 단계 표시
```
┌─────────────────────────────┐
│   ● ○ ○                     │
│ 본인인증 건강정보 완료        │
└─────────────────────────────┘
```
- **현재**: 1/3 단계

### 제목 및 설명
```
┌─────────────────────────────┐
│                             │
│   안전한 서비스 이용을 위해   │
│   본인인증을 진행해 주세요    │
│                             │
└─────────────────────────────┘
```

### 휴대폰 번호 입력
```
┌─────────────────────────────┐
│                             │
│  휴대폰 번호                 │
│  ┌───────────────────────┐  │
│  │ 010-1234-5678        │  │
│  └───────────────────────┘  │
│                             │
│        [인증번호 받기]       │
│                             │
└─────────────────────────────┘
```

#### 입력 필드
- **라벨**: "휴대폰 번호"
- **Placeholder**: "010-0000-0000"
- **Type**: Tel
- **Auto-format**: 자동 하이픈 삽입

#### 인증번호 받기 버튼
- **상태**:
  - 비활성: 번호 미입력 시
  - 활성: 유효한 번호 입력 시
- **스타일**: Primary Button

### 인증번호 입력 (SMS 발송 후)
```
┌─────────────────────────────┐
│                             │
│  인증번호                    │
│  ┌───────────────────────┐  │
│  │ _ _ _ _ _ _         3:00│  │
│  └───────────────────────┘  │
│                             │
│       재전송 (29초 후)       │
│                             │
└─────────────────────────────┘
```

#### 인증번호 필드
- **타입**: 6자리 숫자
- **타이머**: 3분 카운트다운
- **재전송**: 30초 후 활성화

## 4. 하단 UI 구성

### 다음 버튼
```
┌─────────────────────────────┐
│                             │
│      [    다음    ]          │
│                             │
└─────────────────────────────┘
```
- **활성화**: 인증번호 검증 완료 시

## 5. UI 컴포넌트 구조

```jsx
<VerificationScreen>
  <Container>
    <NavBar>
      <BackButton />
      <Title>본인인증</Title>
    </NavBar>

    <ProgressSteps current={0} total={3} />

    <Content>
      <Header>
        <Title>안전한 서비스 이용을 위해</Title>
        <Subtitle>본인인증을 진행해 주세요</Subtitle>
      </Header>

      {/* 휴대폰 번호 */}
      <FormField>
        <Label>휴대폰 번호</Label>
        <PhoneInput
          value={phone}
          onChange={setPhone}
          placeholder="010-0000-0000"
          autoFormat
        />
        <SendButton
          text="인증번호 받기"
          onPress={handleSendCode}
          disabled={!isValidPhone}
        />
      </FormField>

      {/* 인증번호 (SMS 발송 후 표시) */}
      {codeSent && (
        <FormField>
          <Label>인증번호</Label>
          <CodeInput
            value={code}
            onChange={setCode}
            length={6}
            timer={180}
          />
          <ResendButton
            text="재전송"
            onPress={handleResend}
            disabled={resendTimer > 0}
            countdown={resendTimer}
          />
        </FormField>
      )}
    </Content>

    <BottomArea>
      <PrimaryButton
        text="다음"
        onPress={handleNext}
        disabled={!isCodeVerified}
      />
    </BottomArea>
  </Container>
</VerificationScreen>
```

## 6. 기능 로직 (FRD 기반)

### 휴대폰 번호 포맷팅
```javascript
const formatPhoneNumber = (value) => {
  const numbers = value.replace(/[^\d]/g, '');

  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
};
```

### 인증번호 발송
```javascript
const handleSendCode = async () => {
  try {
    setLoading(true);

    const response = await api.post('/api/v1/auth/verification/send', {
      phone: phone.replace(/-/g, '')
    });

    if (response.data.success) {
      setCodeSent(true);
      startTimer(180); // 3분
      startResendTimer(30); // 30초
      showToast('인증번호가 발송되었습니다');
    }
  } catch (error) {
    if (error.code === 'ALREADY_REGISTERED') {
      showError('이미 가입된 번호입니다');
    } else {
      showError('인증번호 발송에 실패했습니다');
    }
  } finally {
    setLoading(false);
  }
};
```

### 인증번호 검증
```javascript
const handleVerifyCode = async (code) => {
  if (code.length !== 6) return;

  try {
    const response = await api.post('/api/v1/auth/verification/verify', {
      phone: phone.replace(/-/g, ''),
      code: code
    });

    if (response.data.success) {
      setIsCodeVerified(true);
      setVerificationToken(response.data.verificationToken);
      showToast('인증이 완료되었습니다', 'success');
    }
  } catch (error) {
    if (error.code === 'INVALID_CODE') {
      showError('인증번호가 올바르지 않습니다');
      setCode('');
    } else if (error.code === 'EXPIRED_CODE') {
      showError('인증번호가 만료되었습니다');
      setCodeSent(false);
    }
  }
};
```

### 타이머 관리
```javascript
const startTimer = (seconds) => {
  setTimer(seconds);
  const interval = setInterval(() => {
    setTimer((prev) => {
      if (prev <= 1) {
        clearInterval(interval);
        setCodeSent(false);
        showError('인증시간이 만료되었습니다');
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
};

const formatTime = (seconds) => {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
};
```

### 다음 단계
```javascript
const handleNext = () => {
  navigation.navigate('HealthInfo', {
    verificationToken: verificationToken,
    phone: phone
  });
};
```

## 7. Validation 규칙

### 휴대폰 번호
- **형식**: 010-XXXX-XXXX
- **길이**: 11자리 (010 포함)
- **정규식**: `/^010-\d{4}-\d{4}$/`

### 인증번호
- **길이**: 6자리 숫자
- **유효시간**: 3분
- **재시도**: 5회 제한

### 에러 케이스
- 중복 번호: "이미 가입된 번호입니다"
- 잘못된 코드: "인증번호가 올바르지 않습니다"
- 만료된 코드: "인증번호가 만료되었습니다"
- 시도 초과: "인증 시도 횟수를 초과했습니다"

## 8. API 목록

### POST /api/v1/auth/verification/send
**목적**: 인증번호 SMS 발송

**Request Body**:
```json
{
  "phone": "01012345678"
}
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "expiresIn": 180,
    "requestId": "uuid"
  }
}
```

**Response 409** (중복):
```json
{
  "success": false,
  "error": {
    "code": "ALREADY_REGISTERED",
    "message": "이미 가입된 번호입니다"
  }
}
```

### POST /api/v1/auth/verification/verify
**목적**: 인증번호 검증

**Request Body**:
```json
{
  "phone": "01012345678",
  "code": "123456"
}
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "verified": true,
    "verificationToken": "jwt_verification_token",
    "expiresIn": 600
  }
}
```

**Response 400** (실패):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CODE",
    "message": "인증번호가 올바르지 않습니다",
    "remainingAttempts": 3
  }
}
```

## 9. 스타일 속성 (Lanove 규칙 적용)

### ProgressSteps
```css
display: flex;
align-items: center;
justify-content: center;
gap: 8px;
margin: 24px 0;
```

### ProgressDot
```css
width: 8px;
height: 8px;
border-radius: 4px;
background-color: #F7C8C0; /* active */
background-color: #E5E5E5; /* inactive */
```

### FormField
```css
margin-top: 24px;
```

### Label
```css
font-family: 'Pretendard';
font-size: 14px;
font-weight: 500;
color: #8C6762;
margin-bottom: 8px;
```

### PhoneInput
```css
background-color: #FFFFFF;
border: 1px solid #E5E5E5;
border-radius: 12px;
padding: 14px 16px;
font-size: 16px;
color: #5A5A5A;
height: 52px;

/* Focus */
border-color: #F7C8C0;
box-shadow: 0 0 0 3px rgba(247, 200, 192, 0.1);
```

### CodeInput
```css
display: flex;
gap: 8px;
justify-content: center;

/* Each digit */
.digit {
  width: 44px;
  height: 52px;
  background: #FFFFFF;
  border: 1px solid #E5E5E5;
  border-radius: 12px;
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  color: #8C6762;
}
```

### Timer
```css
position: absolute;
right: 16px;
top: 50%;
transform: translateY(-50%);
font-size: 14px;
font-weight: 500;
color: #F7C8C0;
```

### SendButton
```css
background-color: #F7C8C0;
color: #FFFFFF;
border-radius: 12px;
padding: 10px 16px;
margin-top: 12px;
font-size: 14px;
font-weight: 600;

/* Disabled */
background-color: #E5E5E5;
color: #9B9B9B;
```

### ResendButton
```css
background-color: transparent;
color: #8C6762;
border: none;
padding: 8px;
margin-top: 8px;
font-size: 14px;
text-decoration: underline;

/* Disabled */
color: #9B9B9B;
```

---

## 추가 고려사항

### 보안
- 인증번호는 서버에서 생성/검증
- 재시도 횟수 제한
- Rate limiting (1분에 최대 3회)

### 사용자 경험
- 자동 포커스 이동 (번호 입력 → 코드 입력)
- 붙여넣기 지원 (코드 6자리)
- 에러 시 필드 흔들림 애니메이션

### 접근성
- VoiceOver: "휴대폰 번호 입력 필드"
- 에러 메시지 자동 읽기
