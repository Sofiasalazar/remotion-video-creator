import type { TemplateDefinition, TemplateName, SceneData } from '../types';

/**
 * Body field convention for multi-element scenes:
 * Use "|" to separate items. Compositions parse this to create cards/grids.
 * Use "::" to separate icon from text within an item (e.g., "⚡::Lightning Fast")
 */

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'product-launch',
    name: 'Product Launch',
    icon: 'rocket',
    description: 'Bold intro, feature highlights, CTA',
    scenes: [
      {
        label: 'Hero',
        headline: 'Introducing ProductName',
        body: 'The next generation of business automation',
        bgColor: '#0A0A0A',
        accentColor: '#8b5cf6',
      },
      {
        label: 'Features',
        headline: 'Built for the Future',
        body: '\u26A1::Lightning Fast|🛡️::Enterprise Security|📊::Real-time Analytics|🔗::Seamless Integration|🌍::Global Scale|🎯::Precision Targeting',
        bgColor: '#0A0A0A',
        accentColor: '#8b5cf6',
      },
      {
        label: 'Key Metric',
        headline: '10x',
        body: 'Faster than traditional solutions|98% customer satisfaction|50M+ data points processed daily',
        bgColor: '#0A0A0A',
        accentColor: '#84cc16',
      },
      {
        label: 'CTA',
        headline: 'Start Building Today',
        body: 'yoursite.com',
        bgColor: '#0A0A0A',
        accentColor: '#8b5cf6',
      },
    ],
  },
  {
    id: 'social-media-promo',
    name: 'Social Media Promo',
    icon: 'megaphone',
    description: 'Eye-catching promo with dynamic text',
    scenes: [
      {
        label: 'Hook',
        headline: 'Stop Scrolling.',
        body: 'This changes everything.',
        bgColor: '#0A0A0A',
        accentColor: '#8b5cf6',
      },
      {
        label: 'Value Grid',
        headline: 'Why Smart Teams Choose Us',
        body: '🚀::Save 40 hours/week|💰::Cut costs by 60%|📈::3x revenue growth|⭐::Top-rated platform',
        bgColor: '#0A0A0A',
        accentColor: '#84cc16',
      },
      {
        label: 'CTA',
        headline: 'Join 10,000+ Teams',
        body: 'Start free today → link in bio',
        bgColor: '#0A0A0A',
        accentColor: '#8b5cf6',
      },
    ],
  },
  {
    id: 'text-animation',
    name: 'Text Animation',
    icon: 'type',
    description: 'Kinetic typography, minimal and clean',
    scenes: [
      {
        label: 'Line 1',
        headline: 'The old way is broken.',
        body: 'Manual processes. Wasted time. Missed opportunities.',
        bgColor: '#0A0A0A',
        accentColor: '#8b5cf6',
      },
      {
        label: 'Line 2',
        headline: 'There is a better way.',
        body: 'Automated. Intelligent. Always on.',
        bgColor: '#0A0A0A',
        accentColor: '#84cc16',
      },
      {
        label: 'Line 3',
        headline: 'Build the future.',
        body: 'Start now.',
        bgColor: '#0A0A0A',
        accentColor: '#8b5cf6',
      },
    ],
  },
  {
    id: 'testimonial',
    name: 'Testimonial / Quote',
    icon: 'quote',
    description: 'Customer quote with attribution',
    scenes: [
      {
        label: 'Quote',
        headline: 'This transformed how we work. Results in the first week.',
        body: 'We reduced manual effort by 80% and our team finally focuses on what matters.',
        bgColor: '#0A0A0A',
        accentColor: '#8b5cf6',
      },
      {
        label: 'Results',
        headline: 'The Impact',
        body: '📈::80% less manual work|⏱️::3x faster delivery|💰::$2M saved annually|⭐::NPS score: 92',
        bgColor: '#0A0A0A',
        accentColor: '#84cc16',
      },
      {
        label: 'Attribution',
        headline: 'Jane Doe',
        body: 'CEO at Acme Corp',
        bgColor: '#0A0A0A',
        accentColor: '#8b5cf6',
      },
    ],
  },
  {
    id: 'company-intro',
    name: 'Company Intro',
    icon: 'building',
    description: 'Who you are, what you do, why it matters',
    scenes: [
      {
        label: 'Brand',
        headline: 'Your Company',
        body: 'Powering the next wave of innovation',
        bgColor: '#0A0A0A',
        accentColor: '#8b5cf6',
      },
      {
        label: 'What We Do',
        headline: 'The Complete Platform',
        body: '🧠::AI-Powered Intelligence|⚡::Accelerated Development|🔄::Recursive Automation|💰::Premium Outcomes|🏛️::Enterprise Architecture|🔧::Modern Tech Stack',
        bgColor: '#0A0A0A',
        accentColor: '#8b5cf6',
      },
      {
        label: 'Why Us',
        headline: 'Why Teams Trust Us',
        body: 'Built by engineers, for engineers|Trusted by 500+ companies worldwide|SOC 2 compliant from day one',
        bgColor: '#0A0A0A',
        accentColor: '#84cc16',
      },
      {
        label: 'Contact',
        headline: 'Let\'s Build Together',
        body: 'hello@yourcompany.com',
        bgColor: '#0A0A0A',
        accentColor: '#8b5cf6',
      },
    ],
  },
];

export function getTemplate(id: TemplateName): TemplateDefinition {
  return TEMPLATES.find((t) => t.id === id)!;
}

export function getDefaultScenes(id: TemplateName): SceneData[] {
  return getTemplate(id).scenes.map((s) => ({ ...s }));
}

/**
 * Parse a body field that may contain pipe-separated items.
 * Each item may have icon::text format.
 */
export function parseItems(body: string): Array<{ icon: string; text: string }> {
  return body.split('|').map((item) => {
    const parts = item.split('::');
    if (parts.length === 2) {
      return { icon: parts[0].trim(), text: parts[1].trim() };
    }
    return { icon: '', text: item.trim() };
  });
}
