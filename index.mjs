import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getEmojis, getThemeWords } from './services/themeService.mjs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// theme

app.get('/getTheme', async (req, res) => {
  const { theme, max } = req.query;
  const {title, words} = await getThemeWords(theme.toUpperCase(), max);
  console.log(title, words);
  res.json({
    title,
    words
  });
});

app.listen(port, () => {
  console.log(`
******************************************
                                          |
 LLM Server running on http://localhost:${port}  |
                                          |
******************************************
`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`Port ${port} is in use, trying another port...`);
    const newPort = parseInt(port) + 1; // Increment the port number by 1
    app.listen(newPort, () => {
      console.log(`
******************************************
                                          |
 LLM Server running on http://localhost:${newPort}  |
                                          |
******************************************
`);
    });
  } else {
    console.error('Server error:', err);
  }
});