/**
 * AI Engine compatibility module
 * Re-exports intelligent response generation and Groq AI functions
 * for client-side hosting compatibility.
 */
export {
  askGroqAi,
  getGroqApiKey,
  setGroqApiKey,
  getGroqModel,
  setGroqModel,
  AVAILABLE_GROQ_MODELS,
  testGroqConnection,
  DEFAULT_GROQ_KEY,
  DEFAULT_GROQ_MODEL,
  getAiEcoResponse
} from './groqService.js';

export { default } from './groqService.js';
