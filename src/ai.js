// src/ai.js — Gemini API wrapper with graceful fallback

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Ask Gemini a question. Returns { content, model, tokens } on success, { error } on failure.
 * Never throws — the ERP keeps working without AI.
 */
export async function askAI(prompt, systemPrompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  if (!apiKey || apiKey === 'PASTE_YOUR_KEY_HERE' || apiKey.trim() === '') {
    return { error: 'AI not configured — add GEMINI_API_KEY to .env' };
  }

  const url = `${GEMINI_BASE}/${model}:generateContent`;

  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1000,
    },
  };

  if (systemPrompt) {
    body.systemInstruction = {
      parts: [{ text: systemPrompt }],
    };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45000);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      const errText = await res.text();
      return { error: `Gemini error ${res.status}: ${errText.slice(0, 300)}` };
    }

    const data = await res.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) return { error: 'Gemini returned an empty response' };

    return {
      content,
      model,
      tokens: data.usageMetadata?.totalTokenCount || 0,
    };
  } catch (e) {
    if (e.name === 'AbortError') return { error: 'Gemini request timed out (45s)' };
    return { error: `Gemini request failed: ${e.message}` };
  }
}

/**
 * Rule-based categorisation fallback — works without AI.
 */
export function ruleBasedCategory(description) {
  const text = (description || '').toLowerCase();
  const rules = [
    { pattern: /(cement|stock|inventory|goods|raw material)/, code: '1200', name: 'Inventory' },
    { pattern: /(salary|salaries|wages|payroll|staff)/, code: '6000', name: 'Salaries & Wages' },
    { pattern: /(rent|lease|office)/, code: '6100', name: 'Rent Expense' },
    { pattern: /(electric|power|water|utility|internet|data|airtime)/, code: '6200', name: 'Utilities' },
    { pattern: /(bank charge|transaction fee|transfer fee)/, code: '6300', name: 'Bank Charges' },
    { pattern: /(depreciation)/, code: '6400', name: 'Depreciation Expense' },
    { pattern: /(diesel|petrol|fuel|transport|logistics|delivery)/, code: '5000', name: 'Cost of Goods Sold' },
  ];
  for (const r of rules) {
    if (r.pattern.test(text)) return { accountCode: r.code, accountName: r.name, method: 'rule' };
  }
  return { accountCode: '5000', accountName: 'Cost of Goods Sold', method: 'default' };
}