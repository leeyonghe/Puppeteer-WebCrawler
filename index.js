const puppeteer = require('puppeteer');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const { initializeDatabase, saveScrapedData, getScrapedData, getRecentScrapedData } = require('./db/mysql');

const app = express();
const port = 3000;

// JSON 파싱을 위한 미들웨어
app.use(express.json());

// Swagger UI 설정
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 데이터베이스 초기화
initializeDatabase().catch(console.error);

async function scrapeWebsite(url) {
    // 브라우저 실행
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null
    });

    try {
        // 새 페이지 열기
        const page = await browser.newPage();
        
        // 웹사이트 접속
        await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // 스크롤 함수
        async function autoScroll() {
            await page.evaluate(async () => {
                await new Promise((resolve) => {
                    let totalHeight = 0;
                    const distance = 100;
                    const timer = setInterval(() => {
                        const scrollHeight = document.body.scrollHeight;
                        window.scrollBy(0, distance);
                        totalHeight += distance;

                        if (totalHeight >= scrollHeight) {
                            clearInterval(timer);
                            resolve();
                        }
                    }, 100);
                });
            });
        }

        // 페이지 스크롤
        await autoScroll();

        // 페이지의 전체 HTML 가져오기
        const content = await page.content();
        
        return {
            success: true,
            content: content
        };

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    } finally {
        // 브라우저 종료
        await browser.close();
    }
}

/**
 * @swagger
 * /scrape:
 *   post:
 *     summary: 웹사이트 스크래핑
 *     description: 지정된 URL의 웹사이트를 스크래핑하고 결과를 저장합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScrapeRequest'
 *     responses:
 *       200:
 *         description: 스크래핑 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScrapeResponse'
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 에러
 */
app.post('/scrape', async (req, res) => {
    const { url } = req.body;
    
    if (!url) {
        return res.status(400).json({
            success: false,
            error: 'URL is required'
        });
    }

    try {
        const result = await scrapeWebsite(url);
        
        if (result.success) {
            // 데이터베이스에 저장
            const id = await saveScrapedData(url, result.content);
            result.id = id;
        }
        
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @swagger
 * /scrape/{id}:
 *   get:
 *     summary: 특정 스크래핑 데이터 조회
 *     description: ID로 특정 스크래핑 데이터를 조회합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 스크래핑 데이터 ID
 *     responses:
 *       200:
 *         description: 데이터 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ScrapedData'
 *       404:
 *         description: 데이터를 찾을 수 없음
 *       500:
 *         description: 서버 에러
 */
app.get('/scrape/:id', async (req, res) => {
    try {
        const data = await getScrapedData(req.params.id);
        if (!data) {
            return res.status(404).json({
                success: false,
                error: 'Data not found'
            });
        }
        res.json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @swagger
 * /scrape:
 *   get:
 *     summary: 최근 스크래핑 데이터 조회
 *     description: 최근에 스크래핑된 데이터 목록을 조회합니다.
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 조회할 데이터 개수
 *     responses:
 *       200:
 *         description: 데이터 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ScrapedData'
 *       500:
 *         description: 서버 에러
 */
app.get('/scrape', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const data = await getRecentScrapedData(limit);
        res.json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 서버 시작
app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
    console.log(`API 문서: http://localhost:${port}/api-docs`);
}); 