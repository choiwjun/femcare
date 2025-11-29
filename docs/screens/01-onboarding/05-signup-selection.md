# FemCare 가입 선택 화면

## 1. 화면 목적
- 회원가입/로그인 방식 선택
- 소셜 로그인 및 이메일 로그인 제공
- 간편하고 명확한 가입 플로우 시작

## 2. 상단 UI 구성

### 네비게이션 바
```
┌─────────────────────────────┐
│  ←                          │
└─────────────────────────────┘
```
- **높이**: 56px
- **좌측**: 뒤로가기 버튼 (온보딩으로 돌아가기)

## 3. 중단 UI 구성

### 로고 및 제목
```
┌─────────────────────────────┐
│                             │
│      [FemCare Logo]         │
│                             │
│    FemCare 시작하기         │
│                             │
│  안전하고 편리한 방법으로     │
│      가입해 주세요           │
│                             │
└─────────────────────────────┘
```

#### 로고
- **크기**: 80x80px
- **색상**: Coral Pink (#F7C8C0)
- **위치**: 상단에서 120px

#### 제목
- **텍스트**: "FemCare 시작하기"
- **폰트**: Pretendard Bold 24px
- **색상**: Rose Brown (#8C6762)
- **위치**: 로고 하단 24px

#### 부제목
- **텍스트**: "안전하고 편리한 방법으로\n가입해 주세요"
- **폰트**: Pretendard Regular 14px
- **색상**: Gray (#5A5A5A)
- **위치**: 제목 하단 12px

### 소셜 로그인 버튼
```
┌─────────────────────────────┐
│                             │
│  [K]  카카오로 시작하기      │
│                             │
│  [N]  네이버로 시작하기      │
│                             │
│  [A]  Apple로 시작하기       │
│                             │
└─────────────────────────────┘
```

각 버튼:
- **높이**: 52px
- **간격**: 12px
- **아이콘**: 24x24px
- **텍스트**: Pretendard SemiBold 16px

#### 카카오 버튼
```css
background: #FEE500;
color: #000000;
```

#### 네이버 버튼
```css
background: #03C75A;
color: #FFFFFF;
```

#### Apple 버튼
```css
background: #000000;
color: #FFFFFF;
```

### 구분선
```
┌─────────────────────────────┐
│                             │
│    ────── 또는 ──────       │
│                             │
└─────────────────────────────┘
```
- **위치**: 소셜 버튼 하단 24px
- **스타일**: 1px solid #E5E5E5
- **텍스트**: Gray (#5A5A5A), 12px

### 이메일 로그인 버튼
```
┌─────────────────────────────┐
│                             │
│  [@]  이메일로 시작하기      │
│                             │
└─────────────────────────────┘
```
- **스타일**: Secondary Button (Outline)
- **색상**: Coral Pink border

## 4. 하단 UI 구성

### 로그인 링크
```
┌─────────────────────────────┐
│                             │
│  이미 계정이 있으신가요? 로그인│
│                             │
└─────────────────────────────┘
```
- **위치**: 하단에서 32px
- **폰트**: Pretendard Regular 14px
- **색상**: Gray (#5A5A5A)
- **링크**: "로그인" - Coral Pink, Underline

### 약관 동의
```
┌─────────────────────────────┐
│                             │
│  가입 시 이용약관 및 개인정보처리방침에│
│         동의하게 됩니다       │
│                             │
└─────────────────────────────┘
```
- **폰트**: Pretendard Regular 12px
- **색상**: Light Gray (#9B9B9B)
- **링크**: Underline

## 5. UI 컴포넌트 구조

```jsx
<SignupSelectionScreen>
  <Container background="#F5EEE8">
    <NavBar>
      <BackButton onPress={handleBack} />
    </NavBar>

    <ScrollView>
      <ContentArea>
        {/* 로고 및 제목 */}
        <Logo source="femcare_logo.svg" size={80} />

        <Title text="FemCare 시작하기" />

        <Subtitle text="안전하고 편리한 방법으로\n가입해 주세요" />

        {/* 소셜 로그인 */}
        <SocialButtons>
          <KakaoButton
            icon="kakao"
            text="카카오로 시작하기"
            onPress={() => handleSocialLogin('kakao')}
          />

          <NaverButton
            icon="naver"
            text="네이버로 시작하기"
            onPress={() => handleSocialLogin('naver')}
          />

          <AppleButton
            icon="apple"
            text="Apple로 시작하기"
            onPress={() => handleSocialLogin('apple')}
          />
        </SocialButtons>

        {/* 구분선 */}
        <Divider text="또는" />

        {/* 이메일 로그인 */}
        <EmailButton
          icon="email"
          text="이메일로 시작하기"
          onPress={handleEmailSignup}
        />

        {/* 로그인 링크 */}
        <LoginLink>
          <Text>이미 계정이 있으신가요? </Text>
          <LinkText onPress={handleLogin}>로그인</LinkText>
        </LoginLink>

        {/* 약관 동의 */}
        <TermsNotice>
          <Text>가입 시 </Text>
          <LinkText onPress={() => showTerms('service')}>이용약관</LinkText>
          <Text> 및 </Text>
          <LinkText onPress={() => showTerms('privacy')}>개인정보처리방침</LinkText>
          <Text>에 동의하게 됩니다</Text>
        </TermsNotice>
      </ContentArea>
    </ScrollView>
  </Container>
</SignupSelectionScreen>
```

## 6. 기능 로직 (FRD 기반)

### 소셜 로그인
```javascript
const handleSocialLogin = async (provider) => {
  try {
    setLoading(true);

    // 소셜 로그인 SDK 호출
    const result = await SocialAuth[provider].login();

    if (result.success) {
      // 백엔드로 토큰 전송
      const response = await api.post('/api/v1/auth/social', {
        provider: provider,
        accessToken: result.accessToken,
        idToken: result.idToken
      });

      if (response.data.isNewUser) {
        // 신규 회원 - 본인인증 화면으로
        navigation.navigate('Verification', {
          socialId: response.data.socialId,
          provider: provider
        });
      } else {
        // 기존 회원 - 토큰 저장 후 홈으로
        await saveTokens(response.data.tokens);
        navigation.navigate('Home');
      }
    }
  } catch (error) {
    showError('로그인에 실패했습니다');
  } finally {
    setLoading(false);
  }
};
```

### 이메일 가입
```javascript
const handleEmailSignup = () => {
  navigation.navigate('EmailSignup');
};
```

### 로그인
```javascript
const handleLogin = () => {
  navigation.navigate('Login');
};
```

### 약관 보기
```javascript
const showTerms = (type) => {
  navigation.navigate('Terms', { type: type });
};
```

## 7. Validation 규칙

### 소셜 로그인 검증
- 각 플랫폼별 SDK 응답 검증
- 필수 필드 존재 확인 (accessToken, email 등)
- 타임아웃: 30초

### 중복 클릭 방지
- 버튼 클릭 후 로딩 상태 동안 비활성화
- 로딩 인디케이터 표시

### 에러 처리
- 네트워크 에러: 재시도 옵션 제공
- SDK 에러: 에러 메시지 표시
- 취소: 조용히 처리 (에러 메시지 없음)

## 8. API 목록

### POST /api/v1/auth/social
**목적**: 소셜 로그인 처리

**Request Body**:
```json
{
  "provider": "kakao|naver|apple",
  "accessToken": "social_access_token",
  "idToken": "id_token_if_available"
}
```

**Response 200** (신규 회원):
```json
{
  "success": true,
  "data": {
    "isNewUser": true,
    "socialId": "uuid",
    "provider": "kakao",
    "email": "user@example.com",
    "name": "홍길동"
  }
}
```

**Response 200** (기존 회원):
```json
{
  "success": true,
  "data": {
    "isNewUser": false,
    "userId": "uuid",
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token",
      "expiresIn": 3600
    },
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "홍길동"
    }
  }
}
```

**Response 400** (에러):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "유효하지 않은 소셜 토큰입니다"
  }
}
```

## 9. 스타일 속성 (Lanove 규칙 적용)

### Logo
```css
width: 80px;
height: 80px;
margin: 120px auto 0;
```

### Title
```css
font-family: 'Pretendard';
font-size: 24px;
font-weight: 700;
color: #8C6762;
text-align: center;
margin-top: 24px;
```

### Subtitle
```css
font-family: 'Pretendard';
font-size: 14px;
font-weight: 400;
color: #5A5A5A;
text-align: center;
line-height: 1.6;
margin-top: 12px;
```

### SocialButtons
```css
display: flex;
flex-direction: column;
gap: 12px;
margin-top: 40px;
padding: 0 20px;
```

### KakaoButton
```css
background-color: #FEE500;
color: #000000;
border-radius: 20px;
height: 52px;
display: flex;
align-items: center;
justify-content: center;
gap: 8px;
font-family: 'Pretendard';
font-size: 16px;
font-weight: 600;
border: none;
```

### NaverButton
```css
background-color: #03C75A;
color: #FFFFFF;
/* ... 나머지 동일 */
```

### AppleButton
```css
background-color: #000000;
color: #FFFFFF;
/* ... 나머지 동일 */
```

### Divider
```css
display: flex;
align-items: center;
margin: 24px 20px;
color: #5A5A5A;
font-size: 12px;

&::before,
&::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: #E5E5E5;
}

&::before {
  margin-right: 16px;
}

&::after {
  margin-left: 16px;
}
```

### EmailButton
```css
background-color: transparent;
color: #F7C8C0;
border: 1.5px solid #F7C8C0;
border-radius: 20px;
height: 52px;
display: flex;
align-items: center;
justify-content: center;
gap: 8px;
font-family: 'Pretendard';
font-size: 16px;
font-weight: 600;
margin: 0 20px;
```

### LoginLink
```css
text-align: center;
margin-top: 32px;
font-family: 'Pretendard';
font-size: 14px;
color: #5A5A5A;
```

### LinkText
```css
color: #F7C8C0;
text-decoration: underline;
font-weight: 500;
```

### TermsNotice
```css
text-align: center;
margin-top: 24px;
margin-bottom: 40px;
padding: 0 40px;
font-family: 'Pretendard';
font-size: 12px;
color: #9B9B9B;
line-height: 1.5;
```

---

## 추가 고려사항

### 소셜 로그인 SDK
- **Kakao**: @react-native-seoul/kakao-login
- **Naver**: @react-native-seoul/naver-login
- **Apple**: @invertase/react-native-apple-authentication

### 로딩 상태
```jsx
{loading && (
  <LoadingOverlay>
    <Spinner color="#F7C8C0" />
    <LoadingText>로그인 중...</LoadingText>
  </LoadingOverlay>
)}
```

### 접근성
- 각 버튼에 명확한 레이블
- VoiceOver: "카카오로 시작하기 버튼"
