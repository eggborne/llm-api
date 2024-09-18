import OpenAI from "openai";
const openai = new OpenAI();

const capitalizeWords = (str) => {
  return str.split(' ')  // Split the string into an array of words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())  // Capitalize the first letter of each word
    .join(' ');  // Join the words back into a string
};

export const getEmojis = async (themeWords) => {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        "role": "system",
        "content": [
          {
            "type": "text",
            "text": `You find 4 different emojis related to a given selection of words, and return them as an array.`
          }
        ]
      },
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": `json themeWords: ${themeWords}`
          }
        ]
      }
    ],
    temperature: 1,
    max_tokens: 1024,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    response_format: {
      "type": "json_object"
    },
  });
  const emojis = JSON.parse(completion.choices[0].message.content).emojis
  return emojis;
};

export const getThemeWords = async (theme, max = 12) => {
  theme = capitalizeWords(theme);
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        "role": "system",
        "content": [
          {
            "type": "text",
            "text": `You find NO MORE THAN ${max} words of 4 or more letters, all related to a given theme. Use mostly words of 4-8 length.`
          }
        ]
      },
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": `json theme: ${theme}`
          }
        ]
      }
    ],
    temperature: 1,
    max_tokens: 1024,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    response_format: {
      "type": "json_object"
    },
  });
  const wordList = JSON.parse(completion.choices[0].message.content).words;
  const emojis = await getEmojis(wordList);
  if (!emojis.length) {
    console.log('NO EMOJIS!');
    return;
  }
  console.log('got', emojis.length, emojis)
  if (emojis.length % 2 !== 0) {
    emojis.length = emojis.length - 1;
  }
  const left = emojis.slice(emojis.length / 2, emojis.length).join(' ');
  const right = emojis.slice(0, emojis.length / 2).join(' ');
  const fancyTitle = `${left} ${theme} ${right}`;
  return {
    title: fancyTitle,
    words: wordList
  };
};