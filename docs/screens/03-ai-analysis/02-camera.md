# FemCare 촬영 화면

## 1. 화면 목적
생리대 사진 촬영 및 AI 분석용 이미지 전송

## 2. 상단 UI
```
┌─────────────────────────────┐
│  ✕              가이드 보기  │
└─────────────────────────────┘
```

## 3. 중단 UI
### 카메라 뷰파인더
```
┌─────────────────────────────┐
│                             │
│    [  카메라 프리뷰  ]       │
│                             │
│    ┌─────────────┐          │
│    │             │          │
│    │   가이드    │          │
│    │   오버레이  │          │
│    │             │          │
│    └─────────────┘          │
│                             │
└─────────────────────────────┘
```

### 가이드 오버레이
- 점선 사각형 (생리대 배치 가이드)
- 중앙 정렬 표시

### 안내 텍스트
```
┌─────────────────────────────┐
│  생리대를 가이드 안에 맞춰주세요│
└─────────────────────────────┘
```

## 4. 하단 UI
```
┌─────────────────────────────┐
│                             │
│  [갤러리]   ⚪(촬영)  [플래시]│
│                             │
└─────────────────────────────┘
```
- 갤러리: 좌측
- 촬영 버튼: 중앙 (큰 원형)
- 플래시: 우측

## 5. UI 컴포넌트
```jsx
<CameraScreen>
  <StatusBar hidden />

  <Header>
    <CloseButton onPress={handleClose} />
    <GuideButton onPress={showGuide} />
  </Header>

  <CameraView
    ref={cameraRef}
    style={styles.camera}
    type={CameraType.back}
  >
    <GuideOverlay />
    <HintText>생리대를 가이드 안에 맞춰주세요</HintText>
  </CameraView>

  <CameraControls>
    <GalleryButton onPress={handleGallery} />
    <CaptureButton onPress={handleCapture} />
    <FlashButton
      flash={flashMode}
      onPress={toggleFlash}
    />
  </CameraControls>
</CameraScreen>
```

## 6. 기능 로직
```javascript
const handleCapture = async () => {
  try {
    setCapturing(true);

    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.8,
      base64: false,
      skipProcessing: false
    });

    // 미리보기 화면으로 이동
    navigation.navigate('ImagePreview', {
      imageUri: photo.uri,
      width: photo.width,
      height: photo.height
    });
  } catch (error) {
    showError('촬영에 실패했습니다');
  } finally {
    setCapturing(false);
  }
};

const handleGallery = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
    allowsEditing: true
  });

  if (!result.canceled) {
    navigation.navigate('ImagePreview', {
      imageUri: result.assets[0].uri
    });
  }
};

const toggleFlash = () => {
  setFlashMode(prev =>
    prev === Camera.Constants.FlashMode.off
      ? Camera.Constants.FlashMode.on
      : Camera.Constants.FlashMode.off
  );
};
```

## 7. Validation
- 카메라 권한 확인
- 저장소 권한 확인 (갤러리)
- 이미지 크기 제한: 10MB

## 8. API
### POST /api/v1/analysis/upload
촬영 후 분석 요청 시 사용

## 9. 스타일
```css
.camera {
  flex: 1;
  width: 100%;
  height: 100%;
}

.guide-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 200px;
  border: 2px dashed rgba(247, 200, 192, 0.8);
  border-radius: 16px;
}

.capture-button {
  width: 72px;
  height: 72px;
  border-radius: 36px;
  background: #FFFFFF;
  border: 4px solid #F7C8C0;
}

.capture-button:active {
  transform: scale(0.95);
}
```
