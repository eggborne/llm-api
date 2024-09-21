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
              "text": `You are an expert in selecting harmonious color palettes for artwork. You receive an array of objects containing color and alpha fields, and an amount. Your task is to suggest 'amount' number of new colors (with similar alpha values) that go well together with the given colorList, taken as a whole.

              Do not suggest a collection consisting of all very similar colors.
              
              Return an 'amount'-length array of new objects containing color and alpha fields in the 'newColors' property of a JSON object.`
            }
          ]
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `json {"colorList": ${JSON.stringify(colorList)}, "amount": ${amount}}`
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