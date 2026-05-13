import { NextRequest, NextResponse } from 'next/server';

const PROMPTS: Record<string, (text: string, lang?: string) => string> = {
  summarize: (text) =>
    `用中文简洁总结以下内容，保留关键信息和要点：

---
${text}
---

总结（中文）：`,

  expand: (text, lang) =>
    `基于以下内容自然地续写扩展，保持一致的风格和语气${lang === 'zh' ? '，用中文输出' : ''}：

---
${text}
---

续写：`,

  polish: (text, lang) =>
    `润色以下文字，修正语法错误、优化表达、提升流畅度，但保留原意和语气${lang === 'zh' ? '，用中文输出' : ''}：

---
${text}
---

润色后：`,

  translate: (text) =>
    `将以下内容翻译为中文，如果原文已经是中文则翻译为英文：

---
${text}
---

翻译：`,
};

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.text !== 'string' || !body.text.trim()) {
    return NextResponse.json({ error: 'No text provided' }, { status: 400 });
  }
  if (!body.action || !PROMPTS[body.action]) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const prompt = PROMPTS[body.action](body.text.trim(), body.language);

  const baseUrl = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com';
  const token = process.env.ANTHROPIC_AUTH_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 503 });
  }

  try {
    const res = await fetch(`${baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': token,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `AI API error: ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const text = data.content?.[0]?.text || '';
    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ error: 'AI request failed' }, { status: 502 });
  }
}
