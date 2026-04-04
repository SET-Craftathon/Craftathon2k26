const axios = require('axios');
const FormData = require('form-data');

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';
const USE_MOCK_NLP = process.env.USE_MOCK_NLP === 'true';

const getMockResponse = (text) => ({
    description: text,
    contentType: 'safe',
    aiConfidence: '0.0',
    severity: 'LOW',
    signals: { nlp: { top_label: 'safe', confidence: 0.0 }, nsfw: null, clip: null, ocr: null },
    file: null,
});

const parseMultipartResponse = (data, boundary) => {
    const result = {};
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'binary');
    const delimiter = Buffer.from(`--${boundary}`);

    let start = buffer.indexOf(delimiter);

    while (start !== -1) {
        const end = buffer.indexOf(delimiter, start + delimiter.length);
        if (end === -1) break;

        const part = buffer.slice(start + delimiter.length, end);
        const partString = part.toString('binary');
        const [headerSection, ...bodyParts] = partString.split('\r\n\r\n');
        const body = bodyParts.join('\r\n\r\n');

        if (!headerSection || !body) { start = end; continue; }

        const nameMatch = headerSection.match(/name="([^"]+)"/);
        const filenameMatch = headerSection.match(/filename="([^"]+)"/);

        if (!nameMatch) { start = end; continue; }

        const name = nameMatch[1];
        const content = body.replace(/\r\n$/, '');

        result[name] = filenameMatch ? Buffer.from(content, 'binary') : content;

        start = end;
    }

    if (result.signals) {
        try { result.signals = JSON.parse(result.signals); } catch {}
    }

    return result;
};

const _mimeFromFilename = (filename = '') => {
    const ext = filename.split('.').pop().toLowerCase();
    const map = {
        jpg: 'image/jpeg', jpeg: 'image/jpeg',
        png: 'image/png', gif: 'image/gif',
        webp: 'image/webp', bmp: 'image/bmp',
    };
    return map[ext] || 'application/octet-stream';
};

const analyzeContent = async (text, imageBuffer = null, imageOriginalName = null) => {
    if (USE_MOCK_NLP) {
        console.log('🧪 Using mock NLP response (USE_MOCK_NLP=true)');
        return getMockResponse(text);
    }

    try {
        const form = new FormData();
        form.append('text', text);

        if (imageBuffer && imageBuffer.length > 0) {
            const filename = imageOriginalName || 'image.jpg';
            form.append('image', imageBuffer, {
                filename,
                contentType: _mimeFromFilename(filename),
            });
        }

        const response = await axios.post(`${FASTAPI_URL}/classify`, form, {
            headers: form.getHeaders(),
            responseType: 'arraybuffer',  // safer than 'text' for binary
        });

        const contentType = response.headers['content-type'] || '';
        const boundaryMatch = contentType.match(/boundary=([^\s;]+)/);

        if (boundaryMatch) {
            return parseMultipartResponse(Buffer.from(response.data), boundaryMatch[1]);
        }

        return JSON.parse(Buffer.from(response.data).toString());
    } catch (err) {
        console.warn(`⚠️ FastAPI unavailable (${err.message}) — using mock NLP response`);
        return getMockResponse(text);
    }
};

module.exports = {
    analyzeContent,
    analyzeText: (text) => analyzeContent(text, null, null),
};