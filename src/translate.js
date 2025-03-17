import { OpenAI } from "openai";

// 初始化 OpenAI
const openaiClient = new OpenAI({
  apiKey: "your-api-key", // 替換成你的 OpenAI API 金鑰
  dangerouslyAllowBrowser: true,
});

const MAX_CHUNK_SIZE = 800;

export function splitTextIntoChunks(text, chunkSize = MAX_CHUNK_SIZE) {
  const sentences = text.split(/(?<=[.!?]) +/); // 根據句子分割文本
  let chunks = [];
  let currentChunk = "";

  sentences.forEach((sentence) => {
    if (currentChunk.length + sentence.length + 1 <= chunkSize) {
      currentChunk = currentChunk ? `${currentChunk} ${sentence}` : sentence;
    } else {
      chunks.push(currentChunk);
      currentChunk = sentence;
    }
  });

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

// const PROMPT = `
// 請你扮演一位具有專業投資與財經知識、熟知價值投資、並熟讀巴非特歷年所有股東信的專業中文翻譯。請依照下列規則，幫我將信的內容翻譯成中文。

// 1. 若有任何金融方面的專業術語，請在翻譯的結果用括弧標示原文。例如業主盈餘（operating earnings）。
// 2. 翻譯風格必須符合繁體中文的慣用語。例如，Berkshire 是波克夏，Berkshire Hathaway 是波克夏海瑟威，Charlie Munger 必須是查理蒙格，Warren Buffett 必須是華倫巴菲特。
// 3. 數字與英文的前後必須有一格空格。
// `;

const PROMPT = `請將下列內容翻譯成繁體中文，並保留 markdown 格式`;
const TOKEN_COST = 0.15 / 10 ** 6; // gpt-4o-mini, in USD

export async function translateText(text) {
  const response = await openaiClient.chat.completions.create({
    model: "gpt-4o-mini", // 使用 GPT-4 模型
    messages: [
      { role: "system", content: PROMPT },
      { role: "user", content: text },
    ],
    max_tokens: 500, // 設置最大 token 數量
    temperature: 0.7,
  });

  const totalTokensUsed = response.usage.total_tokens;
  const cost = totalTokensUsed * TOKEN_COST; // 計算費用
  const translation = response.choices[0].message.content.trim();

  return { translation, cost, totalTokensUsed }; // 返回翻譯結果和費用
}

export function translateDocument(chunks) {
  return Promise.all(chunks.map((chunk) => translateText(chunk))).then(
    (results) => {
      const translations = results
        .map((result) => result.translation)
        .join("\n");
      const totalCost = results.reduce((sum, result) => sum + result.cost, 0);
      const totalTokens = results.reduce(
        (sum, result) => sum + result.totalTokensUsed,
        0
      );
      return { translations, totalCost, totalTokens };
    }
  );
}

export default openaiClient;
