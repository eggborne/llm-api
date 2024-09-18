import express from 'express';
// import path from 'path';
import logger from './logger.mjs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getEmojis, getThemeWords } from './services/themeService.mjs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());

// app.use(express.static(path.join(__dirname, 'public')));
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// theme name -> word list

const defaultThemeOptions = {
  maxLength: 12,
  maxWords: 12
};

app.post('/getThemeWords', async (req, res) => {
  const {
    themeName,
    LLMSettings,
    options
  } = req.body;
  logger.info(`\ngetThemeWords received themeName ${themeName}`);
  try {
    const { wordList, tokensUsed } = await getThemeWords(
      themeName,
      {
        ...defaultThemeOptions,
        ...options
      },
      LLMSettings
    );
    logger.info(`Got ${wordList.length} theme words.`);
    logger.info(wordList);
    res.json({
      wordList,
      tokensUsed
    });
  } catch (error) {
    logger.info('Error in route /getThemeWords!', error);
    res.json({ error });
  }
});

// word list -> emojis

app.post('/getEmojis', async (req, res) => {
  const {
    wordList,
    options
  } = req.body;

  logger.info('\ngetEmojis received wordList');
  logger.info(wordList);

  try {
    const { emojis, tokensUsed } = await getEmojis(wordList, options);

    logger.info(`Got ${emojis.length} emojis:`);
    logger.info(emojis.join(' - '));

    res.json({
      emojis,
      tokensUsed
    });
  } catch (error) {
    logger.info('Error in route /getEmojis!', error);
    res.json({ error });
  }
});

app.post('/generateTheme', async (req, res) => {
  const {
    themeName,
    LLMSettings,
    options
  } = req.body;
  const { wordList, tokensUsed: themeTokensUsed } = await getThemeWords(
    themeName,
    { ...defaultThemeOptions, ...options.theme },
    LLMSettings
  );
  const { emojis, tokensUsed: emojiTokensUsed } = await getEmojis(wordList, options.emoji);
  if (!emojis.length) {
    logger.info('No emojis found.');
  }
  if (emojis.length % 2 !== 0) {
    emojis.length = emojis.length - 1;
  }
  const left = emojis.slice(emojis.length / 2, emojis.length).join(' ');
  const right = emojis.slice(0, emojis.length / 2).join(' ');
  const fancyTitle = `${left} ${themeName} ${right}`;

  const sortedList = wordList.sort((a, b) => b.length - a.length);

  logger.info(fancyTitle);
  logger.info(sortedList);
  res.json({
    data: {
      fancyTitle,
      sortedList,
    },
    tokensUsed: (themeTokensUsed + emojiTokensUsed)
  });
});

app.listen(port, () => {
  logger.info(`
******************************************
                                          
 llm-api ---> http://localhost:${port}
                                          
******************************************
`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.info(`Port ${port} is in use, trying another port...`);
    const newPort = parseInt(port) + 1; // Increment the port number by 1
    app.listen(newPort, () => {
      logger.info(`
******************************************
                                          
 llm-api ---> http://localhost:${newPort}
                                          
******************************************
`);
    });
  } else {
    logger.info('Server error:', err);
  }
});