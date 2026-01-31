# 🎰 Casino Gaming Platform

보안이 강화된 온라인 카지노 게임 플랫폼

## 🎮 게임 목록

1. **블랙잭** (Blackjack) - 딜러와 21에 가까운 숫자 대결
2. **룰렛** (Roulette) - 회전하는 휠에 베팅
3. **바카라** (Baccarat) - 플레이어 vs 뱅커
4. **슬롯머신** (Slot Machine) - 3릴 슬롯
5. **포커** (Texas Hold'em) - 텍사스 홀덤 포커
6. **식보** (Sic Bo) - 주사위 3개 게임
7. **드래곤 타이거** (Dragon Tiger) - 간단한 카드 비교
8. **크랩스** (Craps) - 주사위 게임
9. **빙고** (Bingo) - 숫자 맞추기
10. **키노** (Keno) - 복권 스타일 게임

## 💰 재화 시스템

- **T (Test Money)**: 베타 테스트용 가상 머니
- **M (Money)**: 실제 게임 머니

## 🔒 보안 기능

- ✅ bcrypt 비밀번호 해싱 (salt rounds: 12)
- ✅ JWT 토큰 기반 인증
- ✅ Rate Limiting (DDoS 방지)
- ✅ Input Validation & Sanitization
- ✅ SQL Injection 방지 (Parameterized Queries)
- ✅ XSS 방지
- ✅ CSRF 토큰
- ✅ Helmet.js 보안 헤더
- ✅ CORS 설정
- ✅ 2FA (Two-Factor Authentication) 옵션
- ✅ 트랜잭션 로깅
- ✅ IP 기반 접근 제어

## 🚀 설치 및 실행

### 1. 의존성 설치
```bash
npm run install-all
```

### 2. Supabase 설정

#### Supabase 프로젝트 생성
1. https://supabase.com 접속 및 로그인
2. 새 프로젝트 생성
3. Project Settings > API에서 URL과 anon key 확인

#### 데이터베이스 스키마 설정
1. Supabase Dashboard > SQL Editor 열기
2. `supabase-setup.sql` 파일 내용 복사
3. SQL Editor에 붙여넣기 후 실행 (Run)

### 3. 환경 변수 설정

`.env` 파일 생성:
```bash
PORT=5000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://fvcektvwqlpznybjbxik.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2Y2VrdHZ3cWxwem55YmpieGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MzM1MjIsImV4cCI6MjA4NTQwOTUyMn0.q3G7NOTVcZQ_DYE45CSHHb9CqvhmiBPENvqb3l1yZVQ

# JWT Secret (강력한 랜덤 문자열 생성)
JWT_SECRET=your_very_strong_secret_key_here_change_this

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Origin
CORS_ORIGIN=http://localhost:3000

# 2FA Settings
TWO_FACTOR_ENABLED=true
```

**중요**: JWT_SECRET을 강력한 랜덤 문자열로 변경하세요:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. 서버 실행
```bash
npm start
```

### 5. 클라이언트 개발 모드
```bash
npm run client
```

브라우저에서 http://localhost:3000 접속

## 📦 배포

1. Supabase에서 `supabase-setup.sql` 실행
2. Vercel에 백엔드 배포
3. GitHub Pages에 프론트엔드 배포

## 🛡️ 보안 권장사항

1. **강력한 JWT_SECRET 사용** - 최소 32자 이상의 랜덤 문자열
2. **HTTPS 사용** - 프로덕션에서는 반드시 SSL/TLS 적용
3. **정기적인 의존성 업데이트** - `npm audit` 실행
4. **데이터베이스 백업** - 정기적인 백업 스케줄 설정
5. **로그 모니터링** - 의심스러운 활동 감지
6. **Rate Limiting 조정** - 트래픽에 맞게 설정

## 📝 라이선스

MIT License
