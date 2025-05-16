const mysql = require('mysql2/promise');

// 데이터베이스 연결 설정
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'scraper_user',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'web_scraper',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 테이블 생성 함수
async function initializeDatabase() {
    try {
        const connection = await pool.getConnection();
        
        // scraped_data 테이블 생성
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS scraped_data (
                id INT AUTO_INCREMENT PRIMARY KEY,
                url VARCHAR(255) NOT NULL,
                content LONGTEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        connection.release();
        console.log('데이터베이스 초기화 완료');
    } catch (error) {
        console.error('데이터베이스 초기화 실패:', error);
        throw error;
    }
}

// 데이터 저장 함수
async function saveScrapedData(url, content) {
    try {
        const [result] = await pool.execute(
            'INSERT INTO scraped_data (url, content) VALUES (?, ?)',
            [url, content]
        );
        return result.insertId;
    } catch (error) {
        console.error('데이터 저장 실패:', error);
        throw error;
    }
}

// 데이터 조회 함수
async function getScrapedData(id) {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM scraped_data WHERE id = ?',
            [id]
        );
        return rows[0];
    } catch (error) {
        console.error('데이터 조회 실패:', error);
        throw error;
    }
}

// 최근 스크래핑 데이터 조회 함수
async function getRecentScrapedData(limit = 10) {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM scraped_data ORDER BY created_at DESC LIMIT ?',
            [limit]
        );
        return rows;
    } catch (error) {
        console.error('최근 데이터 조회 실패:', error);
        throw error;
    }
}

module.exports = {
    pool,
    initializeDatabase,
    saveScrapedData,
    getScrapedData,
    getRecentScrapedData
}; 