const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Web Scraper API',
      version: '1.0.0',
      description: 'A web scraping API using Puppeteer and MySQL',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        ScrapeRequest: {
          type: 'object',
          required: ['url'],
          properties: {
            url: {
              type: 'string',
              description: 'URL to scrape',
              example: 'https://example.com',
            },
          },
        },
        ScrapeResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Whether the scraping was successful',
            },
            content: {
              type: 'string',
              description: 'Scraped HTML content',
            },
            id: {
              type: 'integer',
              description: 'ID of the saved scraped data',
            },
            error: {
              type: 'string',
              description: 'Error message if scraping failed',
            },
          },
        },
        ScrapedData: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID of the scraped data',
            },
            url: {
              type: 'string',
              description: 'URL that was scraped',
            },
            content: {
              type: 'string',
              description: 'Scraped HTML content',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the data was scraped',
            },
          },
        },
      },
    },
  },
  apis: ['./index.js'], // API 엔드포인트가 있는 파일 경로
};

module.exports = swaggerJsdoc(options); 