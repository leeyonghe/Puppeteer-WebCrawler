# Puppeteer 웹 스크롤러

Node.js와 Puppeteer를 사용한 웹 스크래핑 API 서버입니다.

## 설치 방법

1. 프로젝트 클론 또는 다운로드
2. 의존성 설치:
```bash
npm install
```

3. MySQL 데이터베이스 설정:
- MySQL 서버가 실행 중이어야 합니다
- 환경 변수 설정 (선택사항):
  ```bash
  export DB_HOST=localhost
  export DB_USER=root
  export DB_PASSWORD=your_password
  export DB_NAME=web_scraper
  ```

## 사용 방법

1. 서버 실행:
```bash
npm start
```

2. API 사용:

### API 문서
Swagger UI를 통해 API 문서를 확인하고 테스트할 수 있습니다:
```
http://localhost:3000/api-docs
```

### 스크래핑 요청
- 엔드포인트: `POST http://localhost:3000/scrape`
- 요청 본문 (JSON):
```json
{
    "url": "https://example.com"
}
```
- 응답 예시:
```json
{
    "success": true,
    "content": "<html>...</html>",
    "id": 1
}
```

### 특정 스크래핑 데이터 조회
- 엔드포인트: `GET http://localhost:3000/scrape/:id`
- 응답 예시:
```json
{
    "success": true,
    "data": {
        "id": 1,
        "url": "https://example.com",
        "content": "<html>...</html>",
        "created_at": "2024-03-21T12:00:00Z"
    }
}
```

### 최근 스크래핑 데이터 조회
- 엔드포인트: `GET http://localhost:3000/scrape?limit=10`
- 응답 예시:
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "url": "https://example.com",
            "content": "<html>...</html>",
            "created_at": "2024-03-21T12:00:00Z"
        }
        // ... more items
    ]
}
```

## 주요 기능

- REST API 엔드포인트 제공
- MySQL 데이터베이스 연동
- Swagger UI를 통한 API 문서화
- 자동 스크롤링
- 헤드리스 모드 지원 (headless 옵션으로 설정 가능)
- 네트워크 요청 완료 대기
- 에러 처리

## API 테스트 방법

### Swagger UI 사용
1. 브라우저에서 `http://localhost:3000/api-docs` 접속
2. 원하는 API 엔드포인트 선택
3. "Try it out" 버튼 클릭
4. 필요한 파라미터 입력
5. "Execute" 버튼으로 API 테스트

### curl 사용
```bash
# 스크래핑 요청
curl -X POST http://localhost:3000/scrape \
-H "Content-Type: application/json" \
-d '{"url": "https://example.com"}'

# 특정 데이터 조회
curl http://localhost:3000/scrape/1

# 최근 데이터 조회
curl http://localhost:3000/scrape?limit=10
```

## 주의사항

- 웹사이트의 robots.txt 정책을 준수하세요.
- 과도한 요청은 피하세요.
- 필요한 경우 적절한 딜레이를 추가하세요.
- 프로덕션 환경에서는 적절한 보안 설정을 추가하세요.
- 데이터베이스 자격 증명을 안전하게 관리하세요.

## API 문서화

API 문서는 Swagger UI를 통해 제공되며, 다음과 같은 정보를 포함합니다:

- 모든 API 엔드포인트 목록
- 각 엔드포인트의 상세 설명
- 요청/응답 스키마
- 예시 요청/응답
- API 직접 테스트 기능

API 문서는 `swagger.js` 파일에서 관리되며, 각 엔드포인트의 JSDoc 주석을 통해 자동으로 생성됩니다. 