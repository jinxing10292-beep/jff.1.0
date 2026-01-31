# 🚀 배포 가이드

## 1단계: Supabase 데이터베이스 설정

### Supabase 설정
1. https://supabase.com/dashboard/project/fvcektvwqlpznybjbxik 접속
2. 왼쪽 메뉴에서 **SQL Editor** 클릭
3. `supabase-setup.sql` 파일 내용 전체 복사
4. SQL Editor에 붙여넣고 **Run** 클릭
5. 성공 메시지 확인

## 2단계: 백엔드 배포 (Vercel)

### Vercel 계정 생성 및 배포
1. https://vercel.com 접속 및 GitHub 계정으로 로그인
2. **Add New** > **Project** 클릭
3. GitHub 저장소 `jinxing10292-beep/jff.1.0` 선택
4. **Root Directory** 설정: 그대로 두기 (루트)
5. **Environment Variables** 추가:
   ```
   SUPABASE_URL=https://fvcektvwqlpznybjbxik.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2Y2VrdHZ3cWxwem55YmpieGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MzM1MjIsImV4cCI6MjA4NTQwOTUyMn0.q3G7NOTVcZQ_DYE45CSHHb9CqvhmiBPENvqb3l1yZVQ
   JWT_SECRET=your_strong_random_secret_here
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   CORS_ORIGIN=https://jinxing10292-beep.github.io
   TWO_FACTOR_ENABLED=true
   NODE_ENV=production
   ```
6. **Deploy** 클릭
7. 배포 완료 후 URL 복사 (예: `https://jff-1-0.vercel.app`)

### JWT Secret 생성
강력한 랜덤 문자열 생성:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 3단계: 프론트엔드 설정 업데이트

### API URL 업데이트
`client/.env.production` 파일 수정:
```
REACT_APP_API_URL=https://your-vercel-url.vercel.app/api
```
(your-vercel-url을 실제 Vercel URL로 변경)

## 4단계: GitHub Pages 배포

### 방법 1: 자동 배포 (권장)

```bash
# client 폴더로 이동
cd client

# gh-pages 패키지 설치
npm install

# 배포 실행
npm run deploy
```

### 방법 2: 수동 배포

```bash
# client 폴더에서 빌드
cd client
npm run build

# build 폴더로 이동
cd build

# Git 초기화 및 배포
git init
git add .
git commit -m "Deploy to GitHub Pages"
git branch -M gh-pages
git remote add origin https://github.com/jinxing10292-beep/jff.1.0.git
git push -u origin gh-pages --force
```

## 5단계: GitHub Pages 활성화

1. GitHub 저장소 접속: https://github.com/jinxing10292-beep/jff.1.0
2. **Settings** > **Pages** 클릭
3. **Source**: Deploy from a branch
4. **Branch**: `gh-pages` 선택, `/root` 선택
5. **Save** 클릭
6. 1-2분 후 https://jinxing10292-beep.github.io/jff.1.0 접속

## 6단계: Vercel CORS 설정 확인

Vercel 대시보드에서 환경 변수 확인:
```
CORS_ORIGIN=https://jinxing10292-beep.github.io
```

## 배포 완료! 🎉

### 접속 URL
- **프론트엔드**: https://jinxing10292-beep.github.io/jff.1.0
- **백엔드**: https://your-vercel-url.vercel.app

### 테스트
1. 웹사이트 접속
2. 회원가입
3. 로그인
4. 10,000T 테스트 머니 확인
5. 게임 플레이

## 문제 해결

### CORS 에러
- Vercel 환경 변수에서 `CORS_ORIGIN` 확인
- GitHub Pages URL과 정확히 일치하는지 확인

### API 연결 실패
- `client/.env.production`의 `REACT_APP_API_URL` 확인
- Vercel 배포 URL이 올바른지 확인
- 다시 빌드 및 배포: `npm run deploy`

### 404 에러 (페이지 새로고침 시)
- `client/public/404.html` 파일이 있는지 확인
- GitHub Pages는 SPA 라우팅을 위한 설정이 필요

### 데이터베이스 연결 실패
- Supabase SQL이 정상적으로 실행되었는지 확인
- Vercel 환경 변수의 `SUPABASE_URL`과 `SUPABASE_ANON_KEY` 확인

## 업데이트 배포

### 프론트엔드 업데이트
```bash
cd client
npm run deploy
```

### 백엔드 업데이트
```bash
git add .
git commit -m "Update backend"
git push origin main
```
Vercel이 자동으로 재배포합니다.

## 보안 체크리스트

- [x] JWT_SECRET이 강력한 랜덤 문자열인가?
- [x] Supabase anon key만 사용하고 service key는 노출되지 않았는가?
- [x] CORS_ORIGIN이 정확한 GitHub Pages URL인가?
- [x] HTTPS 사용 중인가?
- [x] Rate limiting이 활성화되어 있는가?
- [x] 환경 변수가 .gitignore에 포함되어 있는가?
