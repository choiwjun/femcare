# FemCare 디자인 시스템 (Lanove 스타일)

## 컬러 팔레트

### Primary Colors
- **Coral Pink**: `#F7C8C0` - 주요 CTA, 강조 요소
- **Rose Brown**: `#8C6762` - 제목, 중요 텍스트
- **Warm Beige**: `#F5EEE8` - 배경색, 카드 테두리

### Background Colors
- **Main Background**: `#F5EEE8` (Warm Beige)
- **Card Background**: `#FFFFFF` (White)

### Text Colors
- **Primary Text**: `#8C6762` (Rose Brown)
- **Secondary Text**: `#5A5A5A` (Gray)
- **Light Text**: `#9B9B9B`

### Accent Colors
- **Success**: `#7BC9A6`
- **Warning**: `#F5A97F`
- **Error**: `#E89B9B`
- **Info**: `#A8C5E8`

## 타이포그래피

### Font Family
- **Primary**: Pretendard
- **Secondary**: Noto Sans KR

### Font Sizes
- **H1**: 28px / Bold / Line-height: 1.4
- **H2**: 24px / Bold / Line-height: 1.4
- **H3**: 20px / SemiBold / Line-height: 1.5
- **H4**: 18px / SemiBold / Line-height: 1.5
- **Body1**: 16px / Regular / Line-height: 1.6
- **Body2**: 14px / Regular / Line-height: 1.6
- **Caption**: 12px / Regular / Line-height: 1.5
- **Button**: 16px / SemiBold / Line-height: 1.5

## 컴포넌트 스타일

### Card
```css
background: #FFFFFF;
border: 1px solid #F5EEE8;
border-radius: 22px;
padding: 20px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
```

### Button

#### Primary Button
```css
background: #F7C8C0;
color: #FFFFFF;
border-radius: 20px;
padding: 14px 24px;
font-size: 16px;
font-weight: 600;
border: none;
```

#### Secondary Button (Outline)
```css
background: transparent;
color: #F7C8C0;
border: 1.5px solid #F7C8C0;
border-radius: 20px;
padding: 14px 24px;
font-size: 16px;
font-weight: 600;
```

#### Text Button
```css
background: transparent;
color: #8C6762;
border: none;
padding: 10px 16px;
font-size: 14px;
font-weight: 500;
```

### Input Field
```css
background: #FFFFFF;
border: 1px solid #E5E5E5;
border-radius: 12px;
padding: 14px 16px;
font-size: 16px;
color: #5A5A5A;

/* Focus State */
border-color: #F7C8C0;
outline: none;
box-shadow: 0 0 0 3px rgba(247, 200, 192, 0.1);
```

### Icon
- **Stroke Width**: 2px
- **Corner Radius**: 2px (rounded)
- **Size**: 24x24px (기본), 20x20px (small), 32x32px (large)
- **Color**: Rose Brown (#8C6762) 또는 Coral Pink (#F7C8C0)

## 스페이싱

### Padding/Margin Scale
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px

### Layout Margins
- **Screen Horizontal Padding**: 20px
- **Section Vertical Spacing**: 24px
- **Card Inner Padding**: 20px
- **Component Spacing**: 16px

## UI 톤 & 필

- **따뜻함**: 따뜻한 베이지와 코랄 핑크 사용
- **미니멀**: 불필요한 장식 제거, 깔끔한 레이아웃
- **부드러움**: 둥근 모서리(22px, 20px), 부드러운 그림자
- **플랫**: 그라데이션 최소화, 플랫한 색상 사용

## 애니메이션

### Transitions
```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### Fade In
```css
opacity: 0 → 1;
duration: 0.3s;
```

### Slide Up
```css
transform: translateY(20px) → translateY(0);
opacity: 0 → 1;
duration: 0.4s;
```

## 반응형 브레이크포인트

- **Mobile**: 320px ~ 480px
- **Tablet**: 481px ~ 768px
- **Desktop**: 769px 이상

## 접근성

- **최소 터치 영역**: 44x44px
- **색상 대비율**: WCAG AA 기준 (4.5:1 이상)
- **포커스 표시**: 명확한 포커스 아웃라인
