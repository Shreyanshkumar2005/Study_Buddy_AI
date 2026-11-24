const { AppError } = require('../middleware/errorHandler');

/**
 * Generates an AI summary using the native Fetch API.
 * Calls Google Gemini REST API if GEMINI_API_KEY is present,
 * or provides a rich synthesized heuristic summary if no key is configured.
 */
const generateSummaryFromAI = async (title, content) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim() !== '') {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const prompt = `You are an expert academic tutor. Summarize the following study note clearly and concisely with:
1. Executive Summary (2-3 sentences)
2. Key Bullet Points (3-5 important concepts)
3. Actionable Study Takeaway

Title: ${title}
Content:
${content}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 600
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData.error?.message || `Upstream AI provider error (Status: ${response.status})`;
        throw new AppError(`AI API Failure: ${errMsg}`, 502);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new AppError('AI provider returned an empty response.', 502);
      }

      return {
        summaryText: generatedText,
        modelUsed: 'gemini-1.5-flash'
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError(`Failed to communicate with AI service: ${err.message}`, 502);
    }
  }

  // Fallback: Smart local synthesis when no API key is provided
  const sentences = content
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);

  const keyPoints = sentences.slice(0, 4).map((s) => `• ${s}`).join('\n');
  const summaryText = `### AI Summary: ${title}

**Overview:**
${sentences.slice(0, 2).join(' ') || content.substring(0, 180) + '...'}

**Key Concepts Highlighted:**
${keyPoints || '• Essential study points extracted from note.'}

**Key Takeaway:**
Review this material regularly using spaced repetition to reinforce concept retention.`;

  return {
    summaryText,
    modelUsed: 'studybuddy-native-engine'
  };
};

/**
 * Generates interactive practice multiple choice / conceptual questions
 * from study note content.
 */
const generatePracticeQuestionsFromAI = async (title, content) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim() !== '') {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const prompt = `You are a test preparation specialist. Based on the study note below, create 3 multiple-choice practice questions.
Return ONLY valid JSON array with this exact structure:
[
  {
    "id": 1,
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Brief explanation of why this answer is correct."
  }
]

Note Title: ${title}
Note Content:
${content}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData.error?.message || `Upstream AI provider error (Status: ${response.status})`;
        throw new AppError(`AI API Failure: ${errMsg}`, 502);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      let questions;
      try {
        questions = JSON.parse(rawText);
      } catch (parseErr) {
        // In case model wraps in markdown fence
        const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        questions = JSON.parse(cleaned);
      }

      return {
        questions,
        modelUsed: 'gemini-1.5-flash'
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError(`Failed to generate practice questions: ${err.message}`, 502);
    }
  }

  // Fallback: Structured practice quiz generated from the note content
  const words = content.replace(/[^a-zA-Z0-9 ]/g, '').split(/\s+/).filter((w) => w.length > 5);
  const sampleKeyWord = words[0] || 'Core Subject';
  const sampleKeyWord2 = words[1] || 'Primary Focus';

  const questions = [
    {
      id: 1,
      question: `What is the primary topic addressed in "${title}"?`,
      options: [
        `The direct application of ${sampleKeyWord}`,
        'An unrelated theoretical concept',
        'Historical timeline analysis',
        'None of the above'
      ],
      correctIndex: 0,
      explanation: `The study note directly discusses ${sampleKeyWord} in the context of ${title}.`
    },
    {
      id: 2,
      question: `Which concept is emphasized as critical regarding ${sampleKeyWord2}?`,
      options: [
        'Ignoring fundamental foundational principles',
        `Practical understanding and retention of ${sampleKeyWord2}`,
        'External unrelated methodologies',
        'Random procedural variance'
      ],
      correctIndex: 1,
      explanation: `The content establishes ${sampleKeyWord2} as a key pillar in the provided notes.`
    },
    {
      id: 3,
      question: `Based on the notes for ${title}, which study strategy is most effective?`,
      options: [
        'Passive rereading without practice',
        'Synthesizing key definitions and testing self-recall',
        'Skipping foundational concepts',
        'Reviewing only once right before exams'
      ],
      correctIndex: 1,
      explanation: 'Active recall and summarization significantly boost comprehension.'
    }
  ];

  return {
    questions,
    modelUsed: 'studybuddy-native-engine'
  };
};

module.exports = {
  generateSummaryFromAI,
  generatePracticeQuestionsFromAI
};
