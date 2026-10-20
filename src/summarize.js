// src/summarize.js — Phase 2 Part 3: Conversation Summarization
// Uses Gemini when GEMINI_API_KEY is set, falls back to rule-based
// extraction when AI is not configured (so the feature ALWAYS works).

import { askAI } from './ai.js';

const POSITIVE_WORDS = ['good', 'great', 'yes', 'agree', 'interested', 'love', 'happy', 'excited', 'perfect', 'thanks', 'thank you', 'appreciate', 'sounds good', 'definitely', 'absolutely', 'sure', 'ok ', 'okay'];
const NEGATIVE_WORDS = ['no', 'not interested', 'maybe later', 'busy', 'cannot', "can't", 'won\'t', 'refuse', 'unhappy', 'frustrated', 'angry', 'concerned', 'worried', 'problem', 'issue', 'delay', 'cancelled', 'canceled', 'reject'];
const ACTION_VERBS = ['will', 'shall', "let's", 'need to', 'have to', 'must', 'should', 'plan to', 'going to', 'next step', 'follow up', 'reach out', 'send', 'schedule', 'call', 'meet', 'discuss', 'review', 'confirm', 'prepare', 'share', 'ask'];

// Date patterns: 2026-10-20, 20/10/2026, Oct 20, tomorrow, next Monday, etc.
const DATE_REGEX = /\b(\d{4}-\d{1,2}-\d{1,2}|\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*|tomorrow|today|next\s+(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|week|month))\b/gi;
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const PHONE_REGEX = /(\+?[\d\s\-()]{7,})/g;
const NGN_AMOUNT_REGEX = /(NGN|Naira|₦)\s*[\d,]+(?:\.\d+)?|[\d,]+\s*(NGN|Naira)/gi;
const USD_AMOUNT_REGEX = /\$\s*[\d,]+(?:\.\d+)?/g;
const TIME_REGEX = /\b(\d{1,2}(:\d{2})?\s*(am|pm|AM|PM))\b/g;

/**
 * Summarize a conversation thread using Gemini if available.
 * @param {string} text - The full conversation thread
 * @param {object} opts - { type: 'whatsapp'|'email'|'meeting'|'call'|'auto', leadId, contactId }
 * @returns {Promise<{summary, keyPoints, actionItems, sentiment, nextAction, entities, method, tokens}>}
 */
export async function summarizeConversation(text, opts = {}) {
  const cleanedText = String(text || '').slice(0, 12000); // cap at 12k chars

  if (cleanedText.length < 20) {
    return {
      summary: ['Text too short to summarize.'],
      keyPoints: [],
      actionItems: [],
      sentiment: 'neutral',
      nextAction: 'Add more context to the conversation.',
      entities: {},
      method: 'rule',
      tokens: 0,
    };
  }

  // Try Gemini first
  const aiResult = await summarizeWithGemini(cleanedText, opts);
  if (aiResult) return { ...aiResult, method: 'gemini' };

  // Fallback to rule-based
  return { ...summarizeRuleBased(cleanedText), method: 'rule' };
}

async function summarizeWithGemini(text, opts) {
  const typeHint = opts.type && opts.type !== 'auto' ? `This is a ${opts.type} conversation. ` : '';
  const contextHint = opts.leadId || opts.contactId ? 'This conversation is linked to a CRM record.' : '';

  const systemPrompt = `You are an expert sales assistant. Summarize the conversation in a strict JSON format. The user is a sales rep using Afri CRM (built for African business).`;

  const prompt = `${typeHint}${contextHint}

Summarize this conversation and return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "summary": ["bullet 1 (max 15 words)", "bullet 2", "bullet 3"],
  "keyPoints": ["important fact 1", "important fact 2"],
  "actionItems": ["specific action 1 with owner if mentioned", "action 2"],
  "sentiment": "positive" | "neutral" | "negative",
  "nextAction": "one-sentence recommended next step for the sales rep",
  "entities": {
    "dates": ["any dates mentioned"],
    "emails": ["any emails mentioned"],
    "phones": ["any phone numbers mentioned"],
    "amounts": ["any monetary amounts mentioned"]
  }
}

Rules:
- summary must have exactly 3 bullets, each max 15 words
- keyPoints: 0-5 factual observations
- actionItems: 0-5 things someone needs to do
- sentiment: one of "positive", "neutral", "negative"
- nextAction: single sentence, concrete recommendation
- entities: only include arrays that have values

Conversation to summarize:
"""
${text}
"""`;

  const result = await askAI(prompt, systemPrompt);
  if (result.error) return null;

  try {
    // Strip any markdown code fences if present
    let content = result.content.trim();
    content = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(content);
    // Validate structure
    return {
      summary: Array.isArray(parsed.summary) ? parsed.summary.slice(0, 5) : [],
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints.slice(0, 5) : [],
      actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems.slice(0, 5) : [],
      sentiment: ['positive', 'neutral', 'negative'].includes(parsed.sentiment) ? parsed.sentiment : 'neutral',
      nextAction: typeof parsed.nextAction === 'string' ? parsed.nextAction : 'Review and follow up.',
      entities: parsed.entities && typeof parsed.entities === 'object' ? {
        dates: Array.isArray(parsed.entities.dates) ? parsed.entities.dates : [],
        emails: Array.isArray(parsed.entities.emails) ? parsed.entities.emails : [],
        phones: Array.isArray(parsed.entities.phones) ? parsed.entities.phones : [],
        amounts: Array.isArray(parsed.entities.amounts) ? parsed.entities.amounts : [],
      } : {},
      tokens: result.tokens || 0,
    };
  } catch (e) {
    // AI returned non-JSON — fall back to rule-based
    return null;
  }
}

function summarizeRuleBased(text) {
  // Split into sentences (rough)
  const sentences = String(text)
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10 && s.length < 300);

  // Score each sentence by importance
  const scored = sentences.map((s) => {
    let score = 0;
    const lower = s.toLowerCase();
    for (const w of POSITIVE_WORDS) if (lower.includes(w)) score += 1;
    for (const w of NEGATIVE_WORDS) if (lower.includes(w)) score -= 0.5;
    for (const w of ACTION_VERBS) if (lower.includes(w)) score += 2; // action sentences are important
    if (DATE_REGEX.test(s)) score += 3;
    if (NGN_AMOUNT_REGEX.test(s) || USD_AMOUNT_REGEX.test(s)) score += 3;
    if (EMAIL_REGEX.test(s)) score += 2;
    if (TIME_REGEX.test(s)) score += 2;
    if (s.includes('?')) score += 1; // questions often signal next steps
    if (s.length > 80) score += 0.5; // substantial sentences preferred
    return { sentence: s, score };
  });

  // Sort by score desc, pick top 3 unique
  const top = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.sentence);

  // If we have less than 3, just take first 3 sentences
  const summary = top.length >= 3 ? top : sentences.slice(0, 3);

  // Action items: sentences containing action verbs
  const actionItems = sentences
    .filter((s) => {
      const lower = s.toLowerCase();
      return ACTION_VERBS.some((v) => lower.includes(v));
    })
    .slice(0, 5);

  // Key points: sentences containing dates or amounts
  const keyPoints = sentences
    .filter((s) => DATE_REGEX.test(s) || NGN_AMOUNT_REGEX.test(s) || USD_AMOUNT_REGEX.test(s) || EMAIL_REGEX.test(s))
    .slice(0, 5);

  // Sentiment: count positive vs negative words
  const lower = text.toLowerCase();
  let pos = 0, neg = 0;
  for (const w of POSITIVE_WORDS) {
    const matches = lower.match(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'));
    if (matches) pos += matches.length;
  }
  for (const w of NEGATIVE_WORDS) {
    const matches = lower.match(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'));
    if (matches) neg += matches.length;
  }
  let sentiment = 'neutral';
  if (pos > neg + 2) sentiment = 'positive';
  else if (neg > pos + 2) sentiment = 'negative';

  // Next action: prefer first action item, fall back to sentiment-based
  let nextAction;
  if (actionItems.length > 0) {
    nextAction = actionItems[0];
  } else if (sentiment === 'positive') {
    nextAction = 'Send a follow-up — the prospect seems engaged.';
  } else if (sentiment === 'negative') {
    nextAction = 'Address concerns before pushing forward.';
  } else {
    nextAction = 'Send a check-in message to keep the conversation moving.';
  }

  // Entities
  const entities = {
    dates: unique(text.match(DATE_REGEX) || []),
    emails: unique(text.match(EMAIL_REGEX) || []),
    phones: unique(text.match(PHONE_REGEX) || []).filter((p) => p.replace(/\D/g, '').length >= 7),
    amounts: unique([
      ...(text.match(NGN_AMOUNT_REGEX) || []),
      ...(text.match(USD_AMOUNT_REGEX) || []),
    ]),
  };

  return {
    summary,
    keyPoints,
    actionItems,
    sentiment,
    nextAction,
    entities,
    tokens: 0,
  };
}

function unique(arr) {
  return Array.from(new Set(arr.map((s) => String(s).trim()))).slice(0, 10);
}
