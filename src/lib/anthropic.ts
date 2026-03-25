import type { TemplateName, SceneData } from '../types';
import { getTemplate } from './templates';

interface AnthropicResponse {
  content: Array<{ type: string; text: string }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface EnhanceResult {
  scenes: SceneData[];
  inputTokens: number;
  outputTokens: number;
}

export async function enhanceWithAI(
  apiKey: string,
  concept: string,
  templateId: TemplateName
): Promise<EnhanceResult> {
  const template = getTemplate(templateId);

  // Build detailed scene descriptions so AI generates the right format
  const sceneDescriptions = template.scenes.map((s, i) => {
    const hasItems = s.body.includes('|');
    if (hasItems) {
      const itemCount = s.body.split('|').length;
      const hasIcons = s.body.includes('::');
      return `Scene ${i + 1} (${s.label}):
  - headline: string (max 60 chars, punchy)
  - body: ${itemCount} items separated by "|"${hasIcons ? ', each formatted as "emoji::Text Label"' : ''}
  Example format: "${s.body.split('|').slice(0, 2).join('|')}|..."`;
    }
    return `Scene ${i + 1} (${s.label}):
  - headline: string (max 60 chars)
  - body: string (max 150 chars, supporting text)`;
  }).join('\n\n');

  const systemPrompt = `You are a professional video copywriter who creates punchy, impactful content for animated video presentations. Return ONLY valid JSON -- no markdown, no code fences, no explanation. The JSON must be an array of objects with "headline" and "body" fields.

CRITICAL: For scenes that require items (card grids, feature lists), the body field must contain pipe-separated items (item1|item2|item3). When items need icons, use emoji::Text format (e.g., "⚡::Lightning Fast|🛡️::Enterprise Security").`;

  const userPrompt = `Create compelling video content for this concept:

"${concept}"

Template style: ${template.name}
Generate content for exactly ${template.scenes.length} scenes:

${sceneDescriptions}

Return a JSON array with ${template.scenes.length} objects. Each must have "headline" and "body".
Make it professional, specific to the concept, and visually impactful.
For feature/grid scenes, generate ${template.scenes.find(s => s.body.includes('|'))?.body.split('|').length || 4} items with relevant emojis.`;

  let response: Response;
  try {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });
  } catch (err: any) {
    throw new Error(`Could not reach Anthropic. Check your connection. (${err.message})`);
  }

  if (!response.ok) {
    const status = response.status;
    let body = '';
    try { body = await response.text(); } catch {}
    if (status === 401) throw new Error('Invalid API key. Check your key in Settings and try again.');
    if (status === 429) throw new Error('Rate limit reached. Wait a moment and try again.');
    if (status === 400) throw new Error(`Bad request (400): ${body.slice(0, 200)}`);
    throw new Error(`Anthropic API error (${status}). ${body.slice(0, 200)}`);
  }

  const data: AnthropicResponse = await response.json();
  const text = data.content[0]?.text || '[]';

  let parsed: Array<{ headline: string; body: string }>;
  try {
    const cleaned = text.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('AI returned an unexpected format. Try again.');
  }

  const scenes: SceneData[] = template.scenes.map((defaultScene, i) => ({
    ...defaultScene,
    headline: parsed[i]?.headline || defaultScene.headline,
    body: parsed[i]?.body || defaultScene.body,
  }));

  return {
    scenes,
    inputTokens: data.usage.input_tokens,
    outputTokens: data.usage.output_tokens,
  };
}
