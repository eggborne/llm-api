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

export const getColors = async (colorList, options = { total: 4 }) => {
  const amount = options.total - colorList.length;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          "role": "system",
          "content": [
            {
              "type": "text",
              "text": `You are a color theory expert, highly skilled at selecting collections of colors that go well together. You receive a colorList and find ${amount} aesthetically-pleasing complementary colors to those in the list, returning them (in 8-digit hex format) as an array newColors.`
            }
          ]
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `json {"colorList": ${colorList}}`
            }
          ]
        }
      ],
      response_format: {
        "type": "json_object"
      },
      ...defaultLLMSettings,
    });

    const newColors = JSON.parse(completion.choices[0].message.content).newColors;
    const tokensUsed = completion.usage.total_tokens;

    return {
      newColors,
      tokensUsed
    };
  } catch (error) {
    logger.info(`getColors could not get colors: ${error}`);
    return null;
  }
};