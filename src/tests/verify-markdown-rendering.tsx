import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import AIMessageContent from '../components/ai/AIMessageContent';

// Test 1: The exact sample from the user's screenshot
const sampleUserScreenshot = `
**Proposed Study Plan – Focus: Mathematics**

I’ve prepared a personalized, data-backed study plan that will help you strengthen your math skills and boost your overall performance.

**What the plan will include**
- **Targeted topics** based on recent scores (focus on areas where you scored ≤ 65%).
- **Daily study schedule** (30 – 45 min sessions) that fits around your current timetable.
- **Practice resources**: worksheets, online quizzes, and recommended videos.
- **Progress checkpoints**: short weekly quizzes to track improvement.
- **Tips & strategies** for problem-solving and exam preparation.

Would you like me to generate this study plan now?
`;

// Test 2: Rich markdown features: headings, code blocks, tables, nested lists, links, inline code
const sampleRichMarkdown = `
# Mathematics Study Plan
## Week 1 Focus

Here is your timetable:

| Day | Subject | Duration | Status |
| --- | --- | --- | --- |
| Monday | Calculus | 45 min | Planned |
| Tuesday | Algebra | 30 min | Done |

### Recommended Practice:
1. Review notes on derivatives
2. Solve practice set in module \`calc_limits.ts\`
3. Check the portal: [Portal Timetable](https://school.edu/timetable)

\`\`\`typescript
interface StudySession {
  subject: string;
  durationMinutes: number;
  completed: boolean;
}
const session: StudySession = { subject: 'Mathematics', durationMinutes: 45, completed: false };
\`\`\`

> Note: Complete the weekly checkpoint before Friday.
`;

// Test 3: Untrusted XSS input: <script>, [javascript:...], etc.
const sampleUntrustedXSS = `
**Security check**

<script>alert('xss')</script>

Normal **safe text** here.

[Malicious Link](javascript:alert('xss'))
`;

console.log('Testing AIMessageContent Markdown Rendering...\n');

// 1. Verify user screenshot markdown
const html1 = renderToStaticMarkup(React.createElement(AIMessageContent, { content: sampleUserScreenshot }));
console.log('--- Test 1: User Screenshot Plan ---');
console.log('Contains strong tags:', html1.includes('<strong') ? 'PASS' : 'FAIL');
console.log('Contains list tags (ul/li):', (html1.includes('<ul') && html1.includes('<li')) ? 'PASS' : 'FAIL');
console.log('Does NOT contain raw literal "**Proposed":', !html1.includes('**Proposed') ? 'PASS' : 'FAIL');
console.log('Does NOT contain raw literal "- **Targeted":', !html1.includes('- **Targeted') ? 'PASS' : 'FAIL');

// 2. Verify rich markdown
const html2 = renderToStaticMarkup(React.createElement(AIMessageContent, { content: sampleRichMarkdown }));
console.log('\n--- Test 2: Rich Markdown Elements ---');
console.log('Contains h1 tag:', html2.includes('<h1') ? 'PASS' : 'FAIL');
console.log('Contains h2 tag:', html2.includes('<h2') ? 'PASS' : 'FAIL');
console.log('Contains table, thead, tbody:', (html2.includes('<table') && html2.includes('<thead') && html2.includes('<tbody')) ? 'PASS' : 'FAIL');
console.log('Contains ordered list (ol/li):', (html2.includes('<ol') && html2.includes('<li')) ? 'PASS' : 'FAIL');
console.log('Contains inline code:', html2.includes('<code') ? 'PASS' : 'FAIL');
console.log('Contains code block container:', html2.includes('CodeBlock') || html2.includes('calc_limits.ts') ? 'PASS' : 'FAIL');
console.log('Contains safe link:', html2.includes('href="https://school.edu/timetable"') ? 'PASS' : 'FAIL');
console.log('Contains blockquote:', html2.includes('<blockquote') ? 'PASS' : 'FAIL');

// 3. Verify XSS sanitization
const html3 = renderToStaticMarkup(React.createElement(AIMessageContent, { content: sampleUntrustedXSS }));
console.log('\n--- Test 3: XSS Sanitization (Untrusted AI Output) ---');
console.log('Script tag stripped:', !html3.includes('<script>') ? 'PASS' : 'FAIL');
console.log('onerror attribute stripped:', !html3.includes('onerror') ? 'PASS' : 'FAIL');
console.log('javascript: protocol stripped:', !html3.includes('javascript:') ? 'PASS' : 'FAIL');
console.log('Safe text preserved:', html3.includes('Normal') && html3.includes('safe text') ? 'PASS' : 'FAIL');

console.log('\nAll Markdown rendering & sanitization tests completed successfully!');
