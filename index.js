const { GoogleGenerativeAI } = require('@google/generative-ai')
const express = require('express')
const dotenv = require('dotenv')
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const { fileGeneratePart } = require('./fileGeneratePart')

dotenv.config()

const app = express();
const PORT = process.env.PORT || 3000;
const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post('/generate-text', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await model.generateContent(prompt);
    const result = response.response;
    const text = result.text();

    res.status(200).json({output: text });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: error.message });
  }
});


app.post('/generate-from-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const imagePart = fileGeneratePart(req.file.path, 'image/png');
    const prompt = req.body.prompt || 'Describe the image';

    const response = await model.generateContent([prompt, imagePart]);
    const result = response.response;
    const text = result.text();

    res.status(200).json({output: text });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: error.message });
  }
});


app.post('/generate-from-document', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Document file is required' });
    } 
    const documentPart = fileGeneratePart(req.file.path, req.file.mimetype || 'application/pdf');
    const prompt = req.body.prompt || 'Summarize the document';

    const response = await model.generateContent([prompt, documentPart]);
    const result = response.response;
    const text = result.text();

    res.status(200).json({output: text });
  } catch (error) {
    console.error('Error generating document:', error);
    res.status(500).json({ error: error.message });
  } finally {
    fs.unlinkSync(req.file.path);
  }
});

app.post('/generate-from-audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }
    const audioPart = fileGeneratePart(req.file.path, req.file.mimetype || 'audio/mpeg');
    const prompt = req.body.prompt || 'Transcribe the audio';

    const response = await model.generateContent([prompt, audioPart]);
    const result = response.response;
    const text = result.text();

    res.status(200).json({output: text });
  } catch (error) {
    console.error('Error generating audio:', error);
    res.status(500).json({ error: error.message });
  } finally { 
    fs.unlinkSync(req.file.path);
  }
});

app.listen(PORT, () => {
  console.log(`Gemini API Server is running on http://localhost:${PORT}`);
});
