# FemCare 분석 로딩 화면

## 1. 화면 목적
AI 분석 진행 중 사용자에게 피드백 제공

## 2-3. UI 구성
```
┌─────────────────────────────┐
│                             │
│                             │
│      [AI 분석 아이콘]        │
│       (애니메이션)           │
│                             │
│     AI가 분석 중이에요       │
│                             │
│     잠시만 기다려주세요       │
│                             │
│      ●●●○○ (50%)            │
│                             │
│                             │
└─────────────────────────────┘
```

### 진행 단계
1. 이미지 업로드 중 (20%)
2. AI 분석 중 (60%)
3. 결과 생성 중 (20%)

## 4. 하단 UI
- 백그라운드 전환 불가
- 뒤로가기 차단

## 5. UI 컴포넌트
```jsx
<AnalysisLoadingScreen>
  <Container>
    <LottieAnimation
      source={require('./ai-analysis.json')}
      autoPlay
      loop
    />

    <Title>AI가 분석 중이에요</Title>
    <Subtitle>잠시만 기다려주세요</Subtitle>

    <ProgressBar value={progress} />
    <ProgressText>{progressStage}</ProgressText>
  </Container>
</AnalysisLoadingScreen>
```

## 6. 기능 로직
```javascript
const analyzeImage = async (imageUri) => {
  try {
    // 1. 이미지 업로드
    setProgress(0);
    setProgressStage('이미지 업로드 중');

    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'analysis.jpg'
    });

    const uploadResponse = await api.post('/api/v1/analysis/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        setProgress((e.loaded / e.total) * 0.2);
      }
    });

    // 2. AI 분석
    setProgress(0.2);
    setProgressStage('AI 분석 중');

    const analysisId = uploadResponse.data.analysisId;
    const result = await pollAnalysisResult(analysisId);

    setProgress(1);
    setProgressStage('완료');

    // 결과 화면으로 이동
    setTimeout(() => {
      navigation.replace('AnalysisResult', { data: result });
    }, 500);

  } catch (error) {
    showError('분석에 실패했습니다');
    navigation.goBack();
  }
};

const pollAnalysisResult = async (analysisId) => {
  let attempts = 0;
  const maxAttempts = 30;

  while (attempts < maxAttempts) {
    const response = await api.get(`/api/v1/analysis/${analysisId}`);

    if (response.data.status === 'completed') {
      return response.data.result;
    }

    setProgress(0.2 + (attempts / maxAttempts) * 0.6);
    await sleep(1000);
    attempts++;
  }

  throw new Error('분석 타임아웃');
};
```

## 7. Validation
- 타임아웃: 30초
- 에러 시 재시도 옵션 제공

## 8. API
### POST /api/v1/analysis/upload
이미지 업로드

### GET /api/v1/analysis/{id}
분석 상태 폴링

## 9. 스타일
```css
.lottie-animation {
  width: 200px;
  height: 200px;
  margin: 0 auto;
}

.progress-bar {
  width: 200px;
  height: 8px;
  background: #E5E5E5;
  border-radius: 4px;
  overflow: hidden;
  margin: 24px auto;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #F7C8C0, #F5A97F);
  transition: width 0.3s ease;
}
```
