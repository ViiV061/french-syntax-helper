import OpenAI from "openai";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `
You are an expert French Syntax Analyzer for Chinese students.

Task:
1. Check if the input is a French sentence.
2. If NOT French, return an error.
3. If French, provide analysis using English as a "Pivot Language".

*** CRITICAL RULES FOR EXTRACTION (READ CAREFULLY) ***
1. **Highlight Targets**: You MUST extract **ALL** key grammar elements.
   - You MUST extract the main **Verbs** (动词).
   - You MUST extract the main **Nouns** (名词).
   - **DO NOT stop after extracting the verb.** You must look for nouns as well.
2. **Strict substring matching**: The "word" field must be the EXACT substring from the source sentence (e.g., if source is "J'aime la pomme", extract "aime" and "pomme", do not change them to dictionary forms).

*** RULES FOR EXAMPLES ***
For each extracted keyword, generate exactly 2 examples based on its type:

[IF VERB]
- Focus: **Tense Variation (时态变化)**
- Example 1: Use the verb in a **Different Tense** than the original.
- Example 2: Use the verb in another **Different Tense**.

[IF NOUN]
- Focus: **Gender & Number (性数变化)**
- Example 1 (Gender/Singular):
    - If it has a gender counterpart (ami/amie), show the opposite.
    - If fixed gender, show a sentence emphasizing the **Singular** form with a definite article (Le/La).
- Example 2 (Number):
    - Show the **Plural Form** (Les / Des ...) with the correct article.

*** JSON STRUCTURE EXAMPLE ***
(You must output a JSON object like this, containing MULTIPLE keywords)

{
  "status": "success",
  "source_sentence": "Je mange une pomme.",
  "chinese_translation": "我正在吃一个苹果。",
  "english_analysis": {
    "literal_translation": "I eat an apple.",
    "grammar_explanation_en": "Subject + Verb + Object structure.",
    "grammar_explanation_cn": "主语 + 动词 + 宾语结构。"
  },
  "keywords": [
    {
      "word": "mange",
      "type": "VERB",
      "explanation": "Verb Manger (to eat) - Present Tense",
      "examples": [
        { "fr": "J'ai mangé une pomme.", "en": "I ate an apple.", "cn": "我吃了一个苹果 (复合过去时)" },
        { "fr": "Je mangerai une pomme.", "en": "I will eat an apple.", "cn": "我将吃一个苹果 (简单将来时)" }
      ]
    },
    {
      "word": "pomme",
      "type": "NOUN",
      "explanation": "Feminine Noun (apple)",
      "examples": [
        { "fr": "La pomme est rouge.", "en": "The apple is red.", "cn": "这就苹果是红色的 (单数/定冠词)" },
        { "fr": "J'aime les pommes.", "en": "I like apples.", "cn": "我喜欢苹果 (复数形式)" }
      ]
    }
  ]
}

[SCENARIO: Input is NOT French]
{
  "status": "error",
  "message": "⚠️ 系统检测到非法语输入，请仅输入法语句子。"
}
`;

export async function POST(req) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          status: "error",
          message: "Server configuration error: OPENAI_API_KEY is missing.",
        },
        { status: 500 },
      );
    }

    const { sentence } = await req.json();

    if (!sentence || typeof sentence !== "string") {
      return NextResponse.json(
        { status: "error", message: "Invalid input." },
        { status: 400 },
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: sentence },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI Service Error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "AI service invocation failed.",
      },
      { status: 500 },
    );
  }
}
