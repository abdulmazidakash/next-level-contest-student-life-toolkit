// // import NotFound from '../components/NotFound';
// // export default NotFound;
// It looks like your backend error comes from this line:
// ```js
// const resp = await ai.text.generate({ ... });
// ```

// The `@google/genai` SDK does not expose `ai.text.generate`. Instead, you need to create a **model instance** with `ai.getGenerativeModel()` and then call `.generateContent()`. 

// Here’s how you can fix your `generateQuestionWithGemini` helper:

// ```js
// // Fix your Gemini integration
// const { GoogleGenerativeAI } = require("@google/generative-ai");
// const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// async function generateQuestionWithGemini({ topic = "general", difficulty = "medium", forcedType = null }) {
//   const prompt = `
// Generate a single practice exam question for students. Output strictly one JSON object only (no prose).
// Fields required:
// - type: "mcq" | "short" | "tf"
// - difficulty: "easy" | "medium" | "hard"
// - question: string
// - options: array of strings (for mcq or tf). For "tf", options should be ["true","false"].
// - answer: the correct answer string (must exactly match one option for mcq/tf or text for short).
// - topic: short topic string.

// Constraints:
// - If type is mcq, produce 3 or 4 plausible options and ensure 'answer' is one of them.
// - Keep question concise (single sentence when possible).
// - difficulty must match requested difficulty.
// Return JSON only.
// Requested difficulty: ${difficulty}
// Requested topic: ${topic}
// Force type (if provided): ${forcedType || "none"}
// `;

//   // ✅ Correct usage with getGenerativeModel
//   const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
//   const result = await model.generateContent(prompt);
//   const text = result.response.text();

//   // try to extract JSON
//   const jsonMatch = text.match(/\{[\s\S]*\}$/);
//   const jsonText = jsonMatch ? jsonMatch[0] : text;

//   try {
//     const obj = JSON.parse(jsonText);
//     if (!["mcq", "short", "tf"].includes(obj.type)) {
//       obj.type = obj.options && obj.options.length ? "mcq" : "short";
//     }
//     obj.difficulty = difficulty;
//     obj.topic = obj.topic || topic;
//     return obj;
//   } catch (err) {
//     console.error("JSON parse error from Gemini:", err, text);
//     return {
//       type: forcedType || "mcq",
//       difficulty,
//       topic,
//       question: `Sample ${difficulty} question about ${topic}?`,
//       options: ["A", "B", "C", "D"],
//       answer: "A",
//     };
//   }
// }
// ```

// ### ✅ What changed
// 1. Import `GoogleGenerativeAI` instead of `GoogleGenAI`.
//    ```js
//    const { GoogleGenerativeAI } = require("@google/generative-ai");
//    ```

// 2. Use `ai.getGenerativeModel({ model })` instead of `ai.text.generate`.

// 3. Call `model.generateContent(prompt)` instead of `ai.text.generate`.

// 4. Extract text from `result.response.text()`.

// ---

// 👉 Replace your old `generateQuestionWithGemini` with this version and your error `Cannot read properties of undefined (reading 'generate')` will be fixed.

// Do you want me to also update your `/questions/random` route so it **always falls back to Gemini** if MongoDB has no questions for that difficulty?
