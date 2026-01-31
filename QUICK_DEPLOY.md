# ⚡ 빠른 배포 가이드

## 📋 체크리스트

- [ ] 1단계: Supabase 데이터베이스 설정
- [ ] 2단계: Vercel 백엔드 배포
- [ ] 3단계: GitHub Pages 프론트엔드 배포

---

## 1️⃣ Supabase 데이터베이스 설정 (5분)

### 단계:
1. 브라우저에서 열기: https://supabase.com/dashboard/project/fvcektvwqlpznybjbxik
2. 왼쪽 메뉴 **SQL Editor** 클릭
3. 프로젝트의 `supabase-setup.sql` 파일 열기
4. 전체 내용 복사 (Ctrl+A, Ctrl+C)
5. Supabase SQL Editor에 붙여넣기 (Ctrl+V)
6. **Run** 버튼 클릭
7. ✅ "Success" 메시지 확인

---

## 2️⃣ Vercel 백엔드 배포 (10분)

### 단계:
1. 브라우저에서 열기: https://vercel.com
2. **GitHub로 로그인**
3. **Add New** > **Project** 클릭
4. 저장소 선택: `jinxing10292-beep/jff.1.0`
5. **Import** 클릭

### 환경 변수 설정:
**Environment Variables** 섹션에서 다음 추가:

| Name | Value |
|------|-------|
| `SUPABASE_URL` | `https://fvcektvwqlpznybjbxik.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2Y2VrdHZ3cWxwem55YmpieGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MzM1MjIsImV4cCI6MjA4NTQwOTUyMn0.q3G7NOTVcZQ_DYE45CSHHb9CqvhmiBPENvqb3l1yZVQ` |
| `JWT_SECRET` | 아래 명령어로 생성한 값 |
| `CORS_ORIGIN` | `https://jinxing10292-beep.github.io` |
| `RATE_LIMIT_WINDOW_MS` | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | `100` |
| `TWO_FACTOR_ENABLED` | `true` |
| `NODE_ENV` | `production` |

### JWT_SECRET 생성:
터미널에서 실행:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
출력된 문자열을 복사하여 `JWT_SECRET` 값으로 사용

6. **Deploy** 클릭
7. 배포 완료 대기 (2-3분)
8. ✅ 배포 URL 복사 (예: `https://jff-1-0.vercel.app`)

---

## 3️⃣ GitHub Pages 프론트엔드 배포 (5분)

### 단계 A: API URL 업데이트

1. 프로젝트에서 `client/.env.production` 파일 열기
2. Vercel URL로 업데이트:
```
REACT_APP_API_URL=https://jff-1-0.vercel.app/api
```
(jff-1-0을 실제 Vercel URL로 변경)

3. 저장 후 커밋:
```bash
git add client/.env.production
git commit -m "Update production API URL"
git push origin main
```

### 단계 B: 프론트엔드 배포

터미널에서 실행:
```bash
cd client
npm install
npm run deploy
```

배포 완료 대기 (2-3분)

### 단계 C: GitHub Pages 활성화

1. GitHub 저장소 열기: https://github.com/jinxing10292-beep/jff.1.0
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Pages** 클릭
4. **Source**: "Deploy from a branch" 선택
5. **Branch**: `gh-pages` 선택, `/root` 선택
6. **Save** 클릭
7. ✅ 1-2분 후 사이트 접속 가능

---

## 🎉 배포 완료!

### 접속 URL:
**프론트엔드**: https://jinxing10292-beep.github.io/jff.1.0

### 테스트:
1. ✅ 웹사이트 접속
2. ✅ 회원가입
3. ✅ 로그인
4. ✅ 10,000T 테스트 머니 확인
5. ✅ 게임 플레이

---

## 🔧 문제 해결

### "Failed to fetch" 에러
- Vercel 환경 변수 확인
- `client/.env.production`의 API URL 확인
- 다시 빌드: `cd client && npm run deploy`

### CORS 에러
- Vercel 환경 변수에서 `CORS_ORIGIN` 확인
- 값: `https://jinxing10292-beep.github.io` (슬래시 없음)

### 404 에러 (새로고침 시)
- GitHub Pages 설정 확인
- `gh-pages` 브랜치가 생성되었는지 확인

### 데이터베이스 연결 실패
- Supabase SQL이 정상 실행되었는지 확인
- Vercel 환경 변수의 Supabase 정보 확인

---

## 📱 업데이트 배포

### 프론트엔드 업데이트:
```bash
cd client
npm run deploy
```

### 백엔드 업데이트:
```bash
git add .
git commit -m "Update"
git push origin main
```
Vercel이 자동으로 재배포합니다.
