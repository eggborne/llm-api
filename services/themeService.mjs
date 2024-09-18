import OpenAI from "openai";
import logger from '../logger.mjs';
const openai = new OpenAI();

const defaultLLMSettings = {
  temperature: 1,
  max_tokens: 500,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};

const capitalizeWords = (str) => str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');

export const getEmojis = async (wordList, options = { max: 2 }) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          "role": "system",
          "content": [
            {
              "type": "text",
              "text": `You find up to ${options.max} different emojis related to a word list. ${options.max} total emojis; all related to 1+ words in word list.`
            }
          ]
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `json wordList: ${wordList}`
            }
          ]
        }
      ],
      response_format: {
        "type": "json_object"
      },
      // ...defaultLLMSettings,
    });
    const emojis = JSON.parse(completion.choices[0].message.content).emojis;
    const tokensUsed = completion.usage.total_tokens;

    return {
      emojis,
      tokensUsed
    };
  } catch (error) {
    logger.info(`getEmojis could not get emojis: ${error}`);
    return null;
  }
};

export const getThemeWords = async (themeName, options, LLMSettings) => {
  try {
    const requestOptions = {
      ...defaultLLMSettings,
      ...LLMSettings
    };
    const { maxLength, maxWords } = options;
    themeName = capitalizeWords(themeName);
    logger.info(`using maxWords ${maxWords} and requestOptions for ${themeName}:`);
    logger.info(requestOptions);
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          "role": "system",
          "content": [
            {
              "type": "text",
              "text": `You create themed word lists. You find NO MORE THAN ${maxWords} words of length 4 to ${maxLength} (at least two <= length 5), all related to a given theme name. Only single words. Words must not appear in theme name.`
            }
          ]
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `json theme name: ${themeName}`
            }
          ]
        }
      ],
      response_format: {
        "type": "json_object"
      },
      ...requestOptions,
    });

    let wordList = JSON.parse(completion.choices[0].message.content).words;

    wordList = wordList.map(w => w.trim());

    const tokensUsed = completion.usage.total_tokens;

    return {
      wordList,
      tokensUsed
    };
  } catch (error) {
    logger.info('Could not get word list!', error);
    return null;
  }
};