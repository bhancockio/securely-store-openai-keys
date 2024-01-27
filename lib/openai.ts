import OpenAI from "openai";

const params: OpenAI.Chat.ChatCompletionCreateParams = {
  messages: [
    {
      role: "user",
      content:
        "Generate a single dad joke. Do not provide any additional commentary. Only respond with the dad joke. ",
    },
  ],
  model: "gpt-3.5-turbo",
};

export const generateAIDadJoke = async (
  key: string
): Promise<string | null> => {
  const openai = new OpenAI({ apiKey: key, dangerouslyAllowBrowser: true });

  const chatCompletion = await openai.chat.completions.create(params);

  console.log(chatCompletion);

  const joke = chatCompletion.choices[0].message.content;

  return joke;
};
