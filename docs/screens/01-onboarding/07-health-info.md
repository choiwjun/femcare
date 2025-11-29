# FemCare 건강정보 입력 화면

## 1. 화면 목적
- 개인 건강 정보 수집 (월경 주기, 생년월일 등)
- AI 분석 및 주기 예측을 위한 기본 데이터 확보
- 맞춤형 서비스 제공 기반 마련

## 2. 상단 UI 구성

### 네비게이션 바
```
┌─────────────────────────────┐
│  ←     건강정보 입력          │
└─────────────────────────────┘
```

## 3. 중단 UI 구성

### 진행 단계
```
┌─────────────────────────────┐
│   ● ● ○                     │
│ 본인인증 건강정보 완료        │
└─────────────────────────────┘
```
- **현재**: 2/3 단계

### 제목 및 설명
```
┌─────────────────────────────┐
│                             │
│   정확한 건강 관리를 위해     │
│   몇 가지만 알려주세요        │
│                             │
└─────────────────────────────┘
```

### 입력 폼
```
┌─────────────────────────────┐
│                             │
│  생년월일                    │
│  ┌───────────────────────┐  │
│  │ 1990.01.01           │  │
│  └───────────────────────┘  │
│                             │
│  마지막 생리 시작일          │
│  ┌───────────────────────┐  │
│  │ 2025.11.15           │  │
│  └───────────────────────┘  │
│                             │
│  평균 생리 주기              │
│  ┌───────────────────────┐  │
│  │ 28일                 │  │
│  └───────────────────────┘  │
│                             │
│  평균 생리 기간              │
│  ┌───────────────────────┐  │
│  │ 5일                  │  │
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

#### 필드 목록

1. **생년월일**
   - Type: Date Picker
   - Format: YYYY.MM.DD
   - Required: Yes

2. **마지막 생리 시작일**
   - Type: Date Picker
   - Format: YYYY.MM.DD
   - Required: Yes
   - Max: 오늘

3. **평균 생리 주기**
   - Type: Number Picker / Selector
   - Options: 21일 ~ 35일
   - Default: 28일
   - Unit: 일

4. **평균 생리 기간**
   - Type: Number Picker
   - Options: 3일 ~ 10일
   - Default: 5일
   - Unit: 일

### 추가 정보 (선택)
```
┌─────────────────────────────┐
│                             │
│  [ ] 생리통이 심한 편입니다  │
│  [ ] 생리가 불규칙합니다     │
│  [ ] 피임약을 복용 중입니다  │
│                             │
└─────────────────────────────┘
```

## 4. 하단 UI 구성

### 안내 문구
```
┌─────────────────────────────┐
│                             │
│  💡 입력하신 정보는 암호화되어│
│     안전하게 보관됩니다       │
│                             │
└─────────────────────────────┘
```

### 완료 버튼
```
┌─────────────────────────────┐
│                             │
│      [   완료   ]            │
│                             │
└─────────────────────────────┘
```

## 5. UI 컴포넌트 구조

```jsx
<HealthInfoScreen>
  <Container>
    <NavBar>
      <BackButton />
      <Title>건강정보 입력</Title>
    </NavBar>

    <ProgressSteps current={1} total={3} />

    <ScrollView>
      <Header>
        <Title>정확한 건강 관리를 위해</Title>
        <Subtitle>몇 가지만 알려주세요</Subtitle>
      </Header>

      <Form>
        {/* 생년월일 */}
        <FormField>
          <Label>생년월일 <Required>*</Required></Label>
          <DatePicker
            value={birthDate}
            onChange={setBirthDate}
            format="YYYY.MM.DD"
            maxDate={new Date()}
          />
        </FormField>

        {/* 마지막 생리 시작일 */}
        <FormField>
          <Label>마지막 생리 시작일 <Required>*</Required></Label>
          <DatePicker
            value={lastPeriodDate}
            onChange={setLastPeriodDate}
            maxDate={new Date()}
          />
        </FormField>

        {/* 평균 생리 주기 */}
        <FormField>
          <Label>평균 생리 주기 <Required>*</Required></Label>
          <CyclePicker
            value={cycleLength}
            onChange={setCycleLength}
            min={21}
            max={35}
            unit="일"
          />
        </FormField>

        {/* 평균 생리 기간 */}
        <FormField>
          <Label>평균 생리 기간 <Required>*</Required></Label>
          <DurationPicker
            value={periodDuration}
            onChange={setPeriodDuration}
            min={3}
            max={10}
            unit="일"
          />
        </FormField>

        {/* 추가 정보 */}
        <Divider />

        <Label>추가 정보 (선택)</Label>
        <CheckboxGroup>
          <Checkbox
            value={hasSeverePain}
            onChange={setHasSeverePain}
            label="생리통이 심한 편입니다"
          />
          <Checkbox
            value={isIrregular}
            onChange={setIsIrregular}
            label="생리가 불규칙합니다"
          />
          <Checkbox
            value={onBirthControl}
            onChange={setOnBirthControl}
            label="피임약을 복용 중입니다"
          />
        </CheckboxGroup>

        {/* 안내 */}
        <InfoBox>
          <InfoIcon>💡</InfoIcon>
          <InfoText>
            입력하신 정보는 암호화되어\n안전하게 보관됩니다
          </InfoText>
        </InfoBox>
      </Form>
    </ScrollView>

    <BottomArea>
      <PrimaryButton
        text="완료"
        onPress={handleComplete}
        disabled={!isFormValid}
      />
    </BottomArea>
  </Container>
</HealthInfoScreen>
```

## 6. 기능 로직 (FRD 기반)

### 폼 검증
```javascript
const isFormValid = useMemo(() => {
  return (
    birthDate !== null &&
    lastPeriodDate !== null &&
    cycleLength >= 21 && cycleLength <= 35 &&
    periodDuration >= 3 && periodDuration <= 10
  );
}, [birthDate, lastPeriodDate, cycleLength, periodDuration]);
```

### 나이 계산
```javascript
const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};
```

### 다음 예상 생리일 계산
```javascript
const calculateNextPeriod = (lastPeriodDate, cycleLength) => {
  const lastDate = new Date(lastPeriodDate);
  const nextDate = new Date(lastDate);
  nextDate.setDate(lastDate.getDate() + cycleLength);
  return nextDate;
};
```

### 완료 처리
```javascript
const handleComplete = async () => {
  try {
    setLoading(true);

    const healthData = {
      birthDate: birthDate,
      lastPeriodDate: lastPeriodDate,
      cycleLength: cycleLength,
      periodDuration: periodDuration,
      hasSeverePain: hasSeverePain,
      isIrregular: isIrregular,
      onBirthControl: onBirthControl
    };

    const response = await api.post('/api/v1/user/health-info', healthData, {
      headers: {
        'X-Verification-Token': verificationToken
      }
    });

    if (response.data.success) {
      // 회원가입 완료 - 토큰 저장
      await saveTokens(response.data.tokens);

      // 온보딩 완료 화면으로
      navigation.navigate('OnboardingComplete');
    }
  } catch (error) {
    showError('정보 저장에 실패했습니다');
  } finally {
    setLoading(false);
  }
};
```

## 7. Validation 규칙

### 생년월일
- **범위**: 1900년 ~ 현재
- **연령 제한**: 만 13세 이상
- **에러**: "만 13세 이상만 가입할 수 있습니다"

### 마지막 생리 시작일
- **범위**: 과거 ~ 오늘
- **최대**: 1년 이내 권장
- **경고**: 1년 이상 전 날짜 선택 시 "날짜를 확인해 주세요"

### 평균 생리 주기
- **최소**: 21일
- **최대**: 35일
- **권장**: 25-31일 (정상 범위)

### 평균 생리 기간
- **최소**: 3일
- **최대**: 10일
- **권장**: 3-7일 (정상 범위)

### 경고 메시지
```javascript
const showWarnings = () => {
  if (cycleLength < 25 || cycleLength > 31) {
    showInfo('주기가 불규칙할 수 있어요. 정확한 건강 상담을 권장합니다.');
  }

  if (periodDuration > 7) {
    showInfo('생리 기간이 긴 편이에요. 건강 상태를 확인해보세요.');
  }
};
```

## 8. API 목록

### POST /api/v1/user/health-info
**목적**: 건강 정보 저장 및 회원가입 완료

**Request Headers**:
```json
{
  "X-Verification-Token": "verification_jwt_token"
}
```

**Request Body**:
```json
{
  "birthDate": "1990-01-01",
  "lastPeriodDate": "2025-11-15",
  "cycleLength": 28,
  "periodDuration": 5,
  "hasSeverePain": false,
  "isIrregular": false,
  "onBirthControl": false
}
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token",
      "expiresIn": 3600
    },
    "user": {
      "id": "uuid",
      "phone": "01012345678",
      "age": 35,
      "nextPeriodDate": "2025-12-13"
    }
  }
}
```

**Response 400**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_DATA",
    "message": "입력 데이터가 올바르지 않습니다",
    "fields": {
      "cycleLength": "21-35일 사이여야 합니다"
    }
  }
}
```

## 9. 스타일 속성 (Lanove 규칙 적용)

### DatePicker (커스텀)
```css
background-color: #FFFFFF;
border: 1px solid #E5E5E5;
border-radius: 12px;
padding: 14px 16px;
height: 52px;
font-size: 16px;
color: #5A5A5A;
display: flex;
align-items: center;
justify-content: space-between;

/* Icon */
.calendar-icon {
  width: 20px;
  height: 20px;
  color: #F7C8C0;
}
```

### CyclePicker (Wheel Picker)
```css
background-color: #FFFFFF;
border: 1px solid #E5E5E5;
border-radius: 12px;
padding: 14px 16px;
height: 52px;
display: flex;
align-items: center;
justify-content: space-between;

/* Selected Value */
.value {
  font-size: 16px;
  font-weight: 500;
  color: #8C6762;
}

/* Unit */
.unit {
  font-size: 14px;
  color: #5A5A5A;
  margin-left: 4px;
}
```

### Checkbox
```css
display: flex;
align-items: center;
gap: 12px;
padding: 12px 0;

/* Box */
.checkbox-box {
  width: 20px;
  height: 20px;
  border: 2px solid #E5E5E5;
  border-radius: 6px;
  background-color: #FFFFFF;
  transition: all 0.2s;
}

/* Checked */
.checkbox-box.checked {
  background-color: #F7C8C0;
  border-color: #F7C8C0;
}

/* Label */
.checkbox-label {
  font-size: 14px;
  color: #5A5A5A;
}
```

### InfoBox
```css
background-color: rgba(247, 200, 192, 0.1);
border-radius: 12px;
padding: 16px;
margin-top: 32px;
display: flex;
align-items: center;
gap: 12px;
```

### InfoText
```css
font-family: 'Pretendard';
font-size: 13px;
color: #8C6762;
line-height: 1.5;
```

### Required
```css
color: #F7C8C0;
font-size: 14px;
margin-left: 2px;
```

---

## 추가 고려사항

### Date Picker 모달
- iOS 스타일 Wheel Picker
- 확인/취소 버튼
- Overlay 배경 dimmed

### 데이터 보안
- 건강 정보는 AES-256 암호화
- 서버 전송 시 HTTPS
- 민감정보 마스킹 (로그)

### 접근성
- Label과 Input 연결
- 필수 필드 명시
- 에러 메시지 VoiceOver 읽기

### 사용자 가이드
```jsx
<Tooltip>
  평균 생리 주기는 생리 시작일부터
  다음 생리 시작 전날까지의 기간이에요
</Tooltip>
```
