# FemCare PDF 다운로드 화면

## 1. 화면 목적
건강 리포트 PDF 생성 및 다운로드

## 2-4. UI 구성
### 리포트 옵션
```
┌─────────────────────────────┐
│  리포트 기간                 │
│  ○ 최근 3개월               │
│  ● 최근 6개월               │
│  ○ 최근 1년                 │
│                             │
│  포함 항목                   │
│  ☑ 월경 주기 분석           │
│  ☑ 출혈량 그래프            │
│  ☑ PMS 증상 기록            │
│  ☑ 감정 변화 그래프         │
│  ☑ AI 분석 결과             │
│                             │
│  [  PDF 생성하기  ]          │
└─────────────────────────────┘
```

### 생성 중
```
┌─────────────────────────────┐
│                             │
│  리포트 생성 중...           │
│  ━━━━━━━━━━ 60%             │
│                             │
└─────────────────────────────┘
```

### 완료
```
┌─────────────────────────────┐
│      ✓ 생성 완료            │
│                             │
│  건강리포트_202511.pdf       │
│  2.3 MB                     │
│                             │
│  [  다운로드  ] [  공유  ]   │
└─────────────────────────────┘
```

## 5. UI 컴포넌트
```jsx
<PDFDownloadScreen>
  {!generating && !completed && (
    <OptionsForm>
      <PeriodSelector />
      <ItemsCheckbox />
      <GenerateButton onPress={handleGenerate} />
    </OptionsForm>
  )}

  {generating && (
    <GeneratingView>
      <Spinner />
      <ProgressBar value={progress} />
    </GeneratingView>
  )}

  {completed && (
    <CompletedView>
      <SuccessIcon />
      <FileName>{pdfFileName}</FileName>
      <FileSize>{pdfFileSize}</FileSize>
      <Actions>
        <DownloadButton onPress={handleDownload} />
        <ShareButton onPress={handleShare} />
      </Actions>
    </CompletedView>
  )}
</PDFDownloadScreen>
```

## 6. 기능 로직
```javascript
const handleGenerate = async () => {
  try {
    setGenerating(true);

    const response = await api.post('/api/v1/health/report/pdf', {
      period: selectedPeriod,
      includeItems: selectedItems
    });

    const jobId = response.data.jobId;

    // 폴링으로 PDF 생성 완료 대기
    const result = await pollPDFGeneration(jobId);

    setPdfUrl(result.url);
    setPdfFileName(result.fileName);
    setPdfFileSize(result.fileSize);
    setCompleted(true);
  } catch (error) {
    showError('PDF 생성에 실패했습니다');
  } finally {
    setGenerating(false);
  }
};

const handleDownload = async () => {
  const downloadPath = FileSystem.documentDirectory + pdfFileName;

  await FileSystem.downloadAsync(pdfUrl, downloadPath);

  showToast('다운로드 완료');

  // 파일 열기
  await Sharing.shareAsync(downloadPath);
};

const handleShare = async () => {
  await Share.share({
    url: pdfUrl,
    title: '건강 리포트'
  });
};
```

## 7. Validation
- 최소 1개 항목 선택 필수
- 기간: 최소 1개월

## 8. API
### POST /api/v1/health/report/pdf
PDF 생성 요청

**Request**:
```json
{
  "period": "6months",
  "includeItems": ["cycle", "bloodFlow", "pms", "emotion", "ai"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "jobId": "uuid",
    "estimatedTime": 30
  }
}
```

### GET /api/v1/health/report/pdf/{jobId}
PDF 생성 상태 확인

**Response** (완료):
```json
{
  "success": true,
  "data": {
    "status": "completed",
    "url": "https://cdn.femcare.com/reports/xxx.pdf",
    "fileName": "건강리포트_202511.pdf",
    "fileSize": "2.3 MB"
  }
}
```

## 9. 스타일
```css
.options-form {
  padding: 20px;
}

.period-selector {
  margin-bottom: 24px;
}

.items-checkbox {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 20px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #F5EEE8;
}

.generating-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
}

.completed-view {
  text-align: center;
  padding: 48px 20px;
}

.success-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.file-name {
  font-size: 18px;
  font-weight: 600;
  color: #8C6762;
  margin-bottom: 8px;
}

.file-size {
  font-size: 14px;
  color: #9B9B9B;
  margin-bottom: 32px;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
```

---

## 추가 고려사항

### PDF 내용 구성
1. **표지**
   - FemCare 로고
   - 사용자 이름
   - 리포트 기간
   - 생성일

2. **월경 주기 분석**
   - 평균 주기/기간
   - 규칙성 평가
   - 주기 캘린더

3. **출혈량 그래프**
   - 월별 추이
   - 통계 요약

4. **PMS 증상 기록**
   - 증상별 빈도
   - 강도 분석

5. **감정 변화**
   - 감정 분포
   - 주기별 패턴

6. **AI 분석 결과**
   - 주요 소견
   - 건강 권장사항

### 에러 처리
- 생성 실패 시 재시도 옵션
- 타임아웃: 60초

### 접근성
- PDF는 접근 가능한 형식으로 생성
- 텍스트 선택 가능
- 스크린 리더 지원
