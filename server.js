const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const cheerio = require('cheerio');
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MAX_MB = parseInt(process.env.MAX_FILE_SIZE) || 50;
const RATE = parseInt(process.env.RATE_LIMIT) || 5;

app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: MAX_MB * 1024 * 1024 }
});

const limiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: RATE,
    message: { error: 'تم تجاوز الحد الأقصى. حاول بعد ساعة.' },
    standardHeaders: true,
    legacyHeaders: false
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function extractPDF(filePath) {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
}

async function extractURL(url) {
    try {
        const res = await axios.get(url, {
            timeout: 15000,
            headers: { 'User-Agent': 'Mozilla/5.0' },
            maxContentLength: 5 * 1024 * 1024
        });

        if (res.headers['content-type']?.includes('pdf')) {
            return '[PDF link - content not extracted directly]';
        }

        const $ = cheerio.load(res.data);
        $('script, style, nav, footer, header, aside, .ad, .sidebar').remove();
        const text = $('article, main, .content, .post, body')
            .first()
            .text()
            .replace(/\s+/g, ' ')
            .trim();
        return text.substring(0, 15000);
    } catch (e) {
        return `[Could not access: ${url}]`;
    }
}

app.post('/api/analyze', limiter, upload.single('file'), async (req, res) => {
    let filePath = null;

    try {
        let documentText = '';
        let urlText = '';
        const lang = req.body.lang || 'ar';
        const subject = req.body.subject || '';
        const lectureName = req.body.lectureName || '';

        if (req.file) {
            filePath = req.file.path;
            const ext = path.extname(req.file.originalname).toLowerCase();

            if (ext === '.pdf' || req.file.mimetype === 'application/pdf') {
                documentText = await extractPDF(filePath);
            } else {
                documentText = fs.readFileSync(filePath, 'utf-8');
            }
        }

        let urls = [];
        try { urls = JSON.parse(req.body.urls || '[]'); } catch {}

        for (const url of urls.slice(0, 2)) {
            if (url && url.trim().startsWith('http')) {
                const text = await extractURL(url.trim());
                if (text) urlText += `\n\n--- Source: ${url} ---\n${text}`;
            }
        }

        const combined = (documentText + '\n' + urlText).trim();
        if (!combined || combined.length < 20) {
            return res.status(400).json({
                error: lang === 'ar'
                    ? 'لا يوجد محتوى كافٍ لتحليله'
                    : 'Not enough content to analyze'
            });
        }

        const langInstruction = lang === 'ar'
            ? 'باللغة العربية'
            : 'in English';

        const examLang = lang === 'ar'
            ? 'باللغة العربية'
            : 'in the same language as the lecture content';

        const prompt = `You are an expert educational assistant. Analyze the following lecture material and produce a structured JSON response.

Lecture Name: ${lectureName || 'Unknown'}
Subject: ${subject || 'Unknown'}

CONTENT:
${combined.substring(0, 25000)}

Respond ONLY with valid JSON (no markdown, no \`\`\`):
{
  "summary": "Brief overview of the lecture ${langInstruction}, about 100 words.",
  "sections": [
    {
      "title": "Section title as it appears in the material",
      "pages": "Page range if available, otherwise empty string",
      "explanation": "Detailed explanation of this section ${langInstruction} with examples and simplification. At least 150 words per section."
    }
  ],
  "exam": [
    {
      "id": 1,
      "question": "Question text ${examLang}",
      "options": ["A", "B", "C", "D"],
      "correct": 0,
      "explanation": "Why this answer is correct ${langInstruction}"
    }
  ],
  "notes": "Key points, important concepts, and study tips ${langInstruction}. Use bullet points."
}

Rules:
1. Create sections matching the actual structure/headings of the material.
2. Generate exactly 20 MCQ questions of varying difficulty.
3. "correct" is the 0-based index of the right answer.
4. All explanations must be detailed and educational.
5. Do NOT wrap in markdown code blocks. Return raw JSON only.`;

        const model = genAI.getGenerativeModel({
            model: 'gemini-3.1-flash-lite',
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 8192
            }
        });

        const result = await model.generateContent(prompt);
        let responseText = result.response.text();

        responseText = responseText.replace(/```json\s*/gi, '')
            .replace(/```\s*/g, '')
            .trim();

        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Invalid AI response');

        const data = JSON.parse(jsonMatch[0]);

        if (!Array.isArray(data.exam)) data.exam = [];
        if (!Array.isArray(data.sections)) data.sections = [];

        res.json(data);

    } catch (error) {
        console.error('Error:', error.message);
        const statusCode = error.message.includes('API key') ? 401 : 500;
        res.status(statusCode).json({
            error: error.message || 'حدث خطأ أثناء التحليل'
        });
    } finally {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', name: 'The Easiest Way to Study' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});