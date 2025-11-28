# FemCare 주기 상세 화면

## 1. 화면 목적
특정 날짜의 증상 및 건강 기록 상세 조회

## 2. 상단 UI
```
┌─────────────────────────────┐
│  ←   11월 28일 (목)      ⋯  │
└─────────────────────────────┘
```

## 3. 중단 UI
### 주기 정보
```
┌─────────────────────────────┐
│  주기 25일차                 │
│  생리 전기                   │
│  다음 생리까지 3일           │
└─────────────────────────────┘
```

### 증상 기록
```
┌─────────────────────────────┐
│  증상                        │
│                             │
│  ☑ 생리통                   │
│  ☑ 두통                     │
│  ☐ 복통                     │
│  ☐ 피로                     │
│                             │
│  [  증상 추가  ]             │
└─────────────────────────────┘
```

### 감정 기록
```
┌─────────────────────────────┐
│  감정                        │
│                             │
│  😊 😐 😔 😰 😡            │
│      ●                       │
│                             │
└─────────────────────────────┘
```

### 메모
```
┌─────────────────────────────┐
│  메모                        │
│                             │
│  ┌───────────────────────┐  │
│  │ 오늘은 생리통이        │  │
│  │ 평소보다 심한 편...    │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

## 4. 하단 UI
```
┌─────────────────────────────┐
│  [    저장    ]              │
└─────────────────────────────┘
```

## 5. UI 컴포넌트
```jsx
<CycleDetailScreen>
  <NavBar>
    <BackButton />
    <Title>{formatDate(date)}</Title>
    <MenuButton />
  </NavBar>

  <ScrollView>
    <CycleInfo>
      <CycleDay>주기 {cycleDay}일차</CycleDay>
      <Phase>{phase}</Phase>
      <NextPeriod>다음 생리까지 {days}일</NextPeriod>
    </CycleInfo>

    <Section>
      <SectionTitle>증상</SectionTitle>
      <SymptomList>
        {symptoms.map(symptom => (
          <SymptomCheckbox
            key={symptom.id}
            label={symptom.name}
            checked={selectedSymptoms.includes(symptom.id)}
            onChange={() => toggleSymptom(symptom.id)}
          />
        ))}
      </SymptomList>
      <AddButton text="증상 추가" onPress={handleAddSymptom} />
    </Section>

    <Section>
      <SectionTitle>감정</SectionTitle>
      <EmotionSelector
        value={selectedEmotion}
        onChange={setSelectedEmotion}
      />
    </Section>

    <Section>
      <SectionTitle>메모</SectionTitle>
      <TextArea
        value={notes}
        onChange={setNotes}
        placeholder="오늘의 컨디션을 기록해보세요"
        maxLength={500}
      />
    </Section>
  </ScrollView>

  <BottomArea>
    <PrimaryButton text="저장" onPress={handleSave} />
  </BottomArea>
</CycleDetailScreen>
```

## 6. 기능 로직
```javascript
const handleSave = async () => {
  try {
    await api.post('/api/v1/health/record', {
      date: date,
      symptoms: selectedSymptoms,
      emotion: selectedEmotion,
      notes: notes
    });

    showToast('기록이 저장되었습니다');
    navigation.goBack();
  } catch (error) {
    showError('저장에 실패했습니다');
  }
};
```

## 7. Validation
- 증상: 선택 사항
- 감정: 선택 사항
- 메모: 최대 500자

## 8. API
### GET /api/v1/health/record/{date}
### POST /api/v1/health/record

## 9. 스타일
```css
.emotion-selector {
  display: flex;
  justify-content: space-around;
  padding: 24px 0;
}

.emotion-item {
  font-size: 32px;
  opacity: 0.3;
  transition: all 0.2s;
}

.emotion-item.selected {
  opacity: 1;
  transform: scale(1.2);
}
```
