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

### 2. 환경 변수 설정
`.env.example`을 복사하여 `.env` 파일 생성 후 설정

### 3. 데이터베이스 설정
PostgreSQL 데이터베이스 생성 및 스키마 실행:
```bash
psql -U your_user -d casino_db -f server/database/schema.sql
```

### 4. 서버 실행
```bash
npm start
```

### 5. 클라이언트 개발 모드
```bash
npm run client
```

## 📦 GitHub Pages 배포

### 1. 클라이언트 빌드
```bash
npm run build
```

### 2. GitHub Pages 설정
- Repository Settings > Pages
- Source: Deploy from a branch
- Branch: gh-pages / root

### 3. 배포
```bash
cd client/build
git init
git add .
git commit -m "Deploy to GitHub Pages"
git branch -M gh-pages
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin gh-pages --force
```

## 🛡️ 보안 권장사항

1. **강력한 JWT_SECRET 사용** - 최소 32자 이상의 랜덤 문자열
2. **HTTPS 사용** - 프로덕션에서는 반드시 SSL/TLS 적용
3. **정기적인 의존성 업데이트** - `npm audit` 실행
4. **데이터베이스 백업** - 정기적인 백업 스케줄 설정
5. **로그 모니터링** - 의심스러운 활동 감지
6. **Rate Limiting 조정** - 트래픽에 맞게 설정

## 📝 라이선스

MIT License
