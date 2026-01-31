# GitHub Pages 배포 가이드

## 준비사항

1. GitHub 계정 및 저장소 생성
2. Node.js 및 npm 설치
3. PostgreSQL 데이터베이스 (백엔드용)

## 백엔드 배포 (별도 호스팅 필요)

GitHub Pages는 정적 사이트만 호스팅하므로, 백엔드는 다음 중 하나를 선택:

### 옵션 1: Heroku
```bash
# Heroku CLI 설치 후
heroku create your-casino-api
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

### 옵션 2: Railway
1. https://railway.app 접속
2. GitHub 저장소 연결
3. PostgreSQL 추가
4. 환경 변수 설정

### 옵션 3: Render
1. https://render.com 접속
2. New Web Service 생성
3. PostgreSQL 데이터베이스 추가
4. 환경 변수 설정

## 프론트엔드 배포 (GitHub Pages)

### 1. 환경 변수 설정

`client/.env.production` 파일 생성:
```
REACT_APP_API_URL=https://your-backend-url.com/api
```

### 2. 빌드

```bash
cd client
npm install
npm run build
```

### 3. GitHub Pages 배포

#### 방법 A: gh-pages 패키지 사용

```bash
# client 폴더에서
npm install --save-dev gh-pages

# package.json에 추가
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}

# 배포 실행
npm run deploy
```

#### 방법 B: 수동 배포

```bash
cd client/build
git init
git add .
git commit -m "Deploy to GitHub Pages"
git branch -M gh-pages
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin gh-pages --force
```

### 4. GitHub 저장소 설정

1. 저장소 Settings > Pages
2. Source: Deploy from a branch
3. Branch: gh-pages / root
4. Save

### 5. 접속

약 1-2분 후 `https://yourusername.github.io/your-repo/` 에서 접속 가능

## 보안 체크리스트

- [ ] .env 파일이 .gitignore에 포함되어 있는지 확인
- [ ] JWT_SECRET이 강력한 랜덤 문자열인지 확인
- [ ] 데이터베이스 비밀번호가 강력한지 확인
- [ ] CORS_ORIGIN이 프론트엔드 URL로 설정되어 있는지 확인
- [ ] HTTPS 사용 (프로덕션 환경)
- [ ] Rate limiting 설정 확인
- [ ] 백엔드 API가 공개 인터넷에 노출되어 있는지 확인

## 문제 해결

### CORS 에러
백엔드 `.env`의 `CORS_ORIGIN`을 GitHub Pages URL로 설정:
```
CORS_ORIGIN=https://yourusername.github.io
```

### API 연결 실패
프론트엔드 `.env.production`의 `REACT_APP_API_URL`이 올바른지 확인

### 404 에러 (라우팅)
`client/public/404.html` 생성 및 리다이렉트 스크립트 추가 (SPA용)

## 유지보수

### 업데이트 배포
```bash
# 프론트엔드
cd client
npm run deploy

# 백엔드 (Heroku 예시)
git push heroku main
```

### 데이터베이스 백업
```bash
# PostgreSQL 백업
pg_dump -U username -d casino_db > backup.sql

# 복원
psql -U username -d casino_db < backup.sql
```
