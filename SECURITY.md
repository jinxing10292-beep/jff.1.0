# 보안 가이드

## 구현된 보안 기능

### 1. 인증 및 권한 관리
- **bcrypt 비밀번호 해싱**: Salt rounds 12로 강력한 해싱
- **JWT 토큰**: 24시간 만료, 서명 검증
- **2FA (Two-Factor Authentication)**: TOTP 기반 이중 인증
- **계정 잠금**: 5회 로그인 실패 시 15분 잠금

### 2. 입력 검증
- **express-validator**: 모든 입력 데이터 검증
- **SQL Injection 방지**: Parameterized queries 사용
- **XSS 방지**: 입력 sanitization
- **요청 크기 제한**: 10KB로 제한

### 3. 네트워크 보안
- **Helmet.js**: 보안 HTTP 헤더 설정
  - Content-Security-Policy
  - X-Frame-Options
  - X-Content-Type-Options
  - Strict-Transport-Security
- **CORS**: 허용된 origin만 접근 가능
- **Rate Limiting**: 15분당 100 요청 제한

### 4. 데이터베이스 보안
- **트랜잭션 로깅**: 모든 금융 거래 기록
- **FOR UPDATE 락**: 동시성 제어
- **인덱싱**: 성능 최적화 및 보안 로그 검색
- **제약 조건**: 데이터 무결성 보장

### 5. 감사 및 모니터링
- **보안 로그**: 로그인, 등록, 의심스러운 활동 기록
- **IP 추적**: 모든 트랜잭션에 IP 주소 기록
- **User-Agent 로깅**: 클라이언트 정보 추적

## 중국 해커 공격 방어 전략

### 1. DDoS 방어
```javascript
// Rate limiting 강화
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests',
});
```

### 2. SQL Injection 방지
```javascript
// ❌ 나쁜 예
db.query(`SELECT * FROM users WHERE username = '${username}'`);

// ✅ 좋은 예
db.query('SELECT * FROM users WHERE username = $1', [username]);
```

### 3. 세션 하이재킹 방지
- JWT 토큰 만료 시간 설정
- Refresh token 구현 권장
- HTTPS 필수

### 4. 브루트 포스 공격 방지
- 계정 잠금 메커니즘
- CAPTCHA 추가 권장
- 2FA 활성화

### 5. 데이터 암호화
```javascript
// 비밀번호 해싱
const hash = await bcrypt.hash(password, 12);

// 민감한 데이터는 환경 변수로 관리
const secret = process.env.JWT_SECRET;
```

## 추가 보안 권장사항

### 프로덕션 환경

1. **HTTPS 필수**
   - Let's Encrypt 무료 SSL 인증서 사용
   - HTTP → HTTPS 리다이렉트

2. **환경 변수 보안**
   ```bash
   # 강력한 JWT_SECRET 생성
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

3. **데이터베이스 보안**
   - 최소 권한 원칙
   - 정기적인 백업
   - 암호화된 연결 (SSL)

4. **방화벽 설정**
   - 필요한 포트만 개방 (80, 443, 5432)
   - IP 화이트리스트 (관리자 접근)

5. **로그 모니터링**
   - 실시간 로그 분석
   - 이상 패턴 감지
   - 알림 시스템 구축

### 코드 레벨

1. **의존성 관리**
   ```bash
   # 정기적인 보안 감사
   npm audit
   npm audit fix
   ```

2. **에러 처리**
   - 프로덕션에서 상세 에러 메시지 숨김
   - 일반적인 에러 메시지 반환

3. **세션 관리**
   - 로그아웃 시 토큰 무효화
   - 토큰 블랙리스트 구현 권장

## 침해 사고 대응

### 1. 탐지
- 비정상적인 로그인 시도
- 대량의 API 요청
- 데이터베이스 이상 쿼리

### 2. 대응
1. 의심스러운 IP 차단
2. 영향받은 계정 잠금
3. 토큰 무효화
4. 데이터베이스 백업 확인

### 3. 복구
1. 보안 패치 적용
2. 비밀번호 재설정 요구
3. 로그 분석
4. 보안 강화

## 정기 점검 체크리스트

- [ ] npm audit 실행
- [ ] 의존성 업데이트
- [ ] 로그 검토
- [ ] 데이터베이스 백업 확인
- [ ] SSL 인증서 만료일 확인
- [ ] 보안 로그 분석
- [ ] Rate limit 설정 검토
- [ ] 비정상 트래픽 패턴 확인

## 연락처

보안 취약점 발견 시: security@your-domain.com
