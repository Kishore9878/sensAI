import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
// Note: If no API key is set, it will fallback to mock responses so development doesn't break
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY is not defined. Using mock AI responses.");
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Clean and parse JSON responses from Gemini
 */
const parseJSONResponse = (text) => {
  try {
    // Strip markdown code block wrappers if present (e.g. ```json ... ```)
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
      const firstLineBreak = cleaned.indexOf('\n');
      const lastLineBreak = cleaned.lastIndexOf('```');
      cleaned = cleaned.substring(firstLineBreak + 1, lastLineBreak).trim();
    }
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Error parsing Gemini JSON response:", error, "Raw text:", text);
    throw new Error("Invalid response format from AI service");
  }
};

/**
 * Generate Industry Insights
 */
export const generateAIIndustryInsights = async (industry) => {
  const genAI = getAIClient();
  if (!genAI) {
    // Return mock data for testing
    return {
      growthRate: 8.5,
      demandLevel: 'High',
      topSkills: ['React.js', 'Node.js', 'MongoDB', 'System Design', 'Cloud Computing'],
      marketOutlook: 'Positive',
      keyTrends: [
        'Shift towards serverless and edge compute technologies.',
        'Increased integration of Generative AI in daily workflows.',
        'High demand for full-stack developers with deployment knowledge.'
      ],
      recommendedSkills: ['TypeScript', 'Docker', 'GraphQL'],
      salaryRanges: [
        { role: 'Junior Full Stack Developer', min: 60000, max: 90000, median: 75000, location: 'Remote/US' },
        { role: 'Senior Full Stack Developer', min: 120000, max: 180000, median: 150000, location: 'Remote/US' },
        { role: 'Tech Lead', min: 160000, max: 220000, median: 190000, location: 'Remote/US' }
      ]
    };
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = `
    You are an expert career analyst. Generate industry insights for the industry "${industry}".
    Provide the output in STRICT JSON format, with the following keys and data types:
    {
      "growthRate": number (e.g., 5.4),
      "demandLevel": "High" | "Medium" | "Low",
      "topSkills": ["skill1", "skill2", ...],
      "marketOutlook": "Positive" | "Neutral" | "Negative",
      "keyTrends": ["trend1", "trend2", ...],
      "recommendedSkills": ["skill1", "skill2", ...],
      "salaryRanges": [
        {
          "role": "role name",
          "min": number,
          "max": number,
          "median": number,
          "location": "location name (optional)"
        }
      ]
    }
    Ensure the JSON is perfectly valid. Do not write any text outside of the JSON block.
  `;

  const result = await model.generateContent(prompt);
  return parseJSONResponse(result.response.text());
};

/**
 * Generate Interview Questions
 */
export const generateAIInterviewQuestions = async (industry, role, category) => {
  const genAI = getAIClient();
  if (!genAI) {
    return [
      {
        question: "What is the primary purpose of the 'useEffect' hook in React?",
        options: ["To define state variables", "To conditionally render components", "To perform side effects after rendering", "To handle user input events"],
        answer: "To perform side effects after rendering",
        feedback: "The 'useEffect' hook allows you to perform side effects in functional components, such as data fetching, subscriptions, and DOM manipulations."
      },
      {
        question: "Which method is used to update the state in a React functional component?",
        options: ["setState()", "useState()", "forceUpdate()", "props"],
        answer: "useState()",
        feedback: "useState() is the React hook used to manage state in functional components."
      },
      {
        question: "Which of the following is NOT a core feature of React?",
        options: ["Virtual DOM", "Two-way data binding", "Component-based architecture", "Unidirectional data flow"],
        answer: "Two-way data binding",
        feedback: "React utilizes a unidirectional data flow, not two-way data binding."
      },
      {
        question: "In Tailwind CSS, what is the purpose of the '@apply' directive?",
        options: ["To apply pre-defined utility classes", "To import third-party CSS files", "To create custom animations", "To compile utility styles at runtime"],
        answer: "To apply pre-defined utility classes",
        feedback: "@apply directly inlines the styles of a pre-defined utility class into the current styles."
      },
      {
        question: "In Node.js, what is the primary purpose of the 'require()' function?",
        options: ["To request external API data", "To import modules and libraries", "To register event handlers", "To execute asynchronous queries"],
        answer: "To import modules and libraries",
        feedback: "The 'require()' function is used to load and cache CommonJS modules in Node.js."
      },
      {
        question: "Which HTML5 tag is used to specify a footer for a document or section?",
        options: ["<bottom>", "<footer>", "<section>", "<aside>"],
        answer: "<footer>",
        feedback: "The <footer> tag defines a footer for a document or section, typically containing author info, copyright, or contact links."
      },
      {
        question: "Which CSS property controls the text size?",
        options: ["font-style", "text-size", "font-size", "text-style"],
        answer: "font-size",
        feedback: "The font-size CSS property sets the size of the font."
      },
      {
        question: "How do you select an element with id 'demo' in CSS?",
        options: [".demo", "#demo", "*demo", "demo"],
        answer: "#demo",
        feedback: "The '#' selector is used to target elements with a specific id attribute."
      },
      {
        question: "What does XML stand for?",
        options: ["eXtensible Markup Language", "eXecutable Multiple Language", "eXtra Modern Link", "eXamine Multiple Line"],
        answer: "eXtensible Markup Language",
        feedback: "XML stands for eXtensible Markup Language and is designed to store and transport data."
      },
      {
        question: "Which HTTP status code represents 'Internal Server Error'?",
        options: ["400 Bad Request", "404 Not Found", "500 Internal Server Error", "502 Bad Gateway"],
        answer: "500 Internal Server Error",
        feedback: "The HTTP 500 Internal Server Error server error response code indicates that the server encountered an unexpected condition that prevented it from fulfilling the request."
      }
    ];
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = `
    Generate 10 multiple-choice interview questions for a candidate in the industry "${industry}", applying for the role "${role}".
    The interview type/category is "${category}" (e.g. Technical, Behavioral, System Design).
    Provide the output in STRICT JSON format, as an array of objects:
    [
      {
        "question": "The question text",
        "options": ["option A", "option B", "option C", "option D"],
        "answer": "The exact correct option string from the options array",
        "feedback": "A brief, clear explanation of why this option is correct"
      }
    ]
    Ensure the JSON is valid. Do not write any text outside the JSON array.
  `;

  const result = await model.generateContent(prompt);
  return parseJSONResponse(result.response.text());
};

/**
 * Evaluate Interview Answers
 */
export const evaluateAIInterviewAnswers = async (questionsAndAnswers) => {
  const genAI = getAIClient();
  if (!genAI) {
    return {
      quizScore: 85,
      questions: questionsAndAnswers.map(q => ({
        ...q,
        feedback: "Good attempt. Your answer is correct and covers the main points.",
        isCorrect: true
      })),
      improvementTip: "Practice speaking clearly and focus on structuring your technical explanations."
    };
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = `
    You are an expert interviewer. Grade the user's responses to the following questions.
    Input array:
    ${JSON.stringify(questionsAndAnswers, null, 2)}

    For each item, evaluate the user's answer ("userAnswer") against the ideal answer ("answer").
    Compute an overall "quizScore" out of 100 based on the correctness.
    Return a STRICT JSON response in this format:
    {
      "quizScore": number (overall score out of 100),
      "questions": [
        {
          "question": "question text",
          "answer": "ideal answer",
          "userAnswer": "user's answer",
          "feedback": "constructive feedback on user answer",
          "isCorrect": boolean
        }
      ],
      "improvementTip": "AI generated improvement tip for the candidate"
    }
    Ensure the JSON is valid. Do not write any text outside the JSON structure.
  `;

  const result = await model.generateContent(prompt);
  return parseJSONResponse(result.response.text());
};

/**
 * Generate Cover Letter
 */
export const generateAICoverLetter = async (profile, jobDescription, companyName, jobTitle) => {
  const genAI = getAIClient();
  if (!genAI) {
    return `Dear Hiring Manager at ${companyName},

I am writing to express my strong interest in the ${jobTitle} position. With my background in the industry, my core skills in ${profile.skills.join(', ')}, and my ${profile.experience} years of experience, I am confident in my ability to add significant value to your team.

Here is how my experience aligns with the job requirements:
${jobDescription ? `- Relevant Job Match: ${jobDescription.substring(0, 150)}...` : '- Strong technical skills and adaptive problem-solving skills.'}

I look forward to discussing how my skills and background meet your needs.

Sincerely,
[Your Name]`;
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = `
    Write a tailored, professional cover letter for a candidate applying to the position of "${jobTitle}" at "${companyName}".
    Here is the user's profile:
    - Bio: ${profile.bio}
    - Skills: ${profile.skills.join(', ')}
    - Experience: ${profile.experience} years
    - Education: ${JSON.stringify(profile.education)}
    - Career Goals: ${profile.careerGoals}

    Here is the job description:
    "${jobDescription}"

    Format the cover letter in professional markdown format. Address it to the hiring manager.
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

/**
 * Generate/Optimize Resume and Provide ATS Review
 */
export const generateAIResumeAndATS = async (profile, careerGoals, existingResumeText = '') => {
  const genAI = getAIClient();
  if (!genAI) {
    return {
      content: `# ${profile.userId ? 'Professional Resume' : 'Resume'}
## Professional Summary
Experienced specialist with expertise in ${profile.skills.slice(0, 3).join(', ')}.

## Core Skills
${profile.skills.map(s => `- ${s}`).join('\n')}

## Education
${profile.education.map(e => `- ${e.degree} in ${e.fieldOfStudy} at ${e.school} (${e.startYear}-${e.endYear})`).join('\n')}

## Experience
- ${profile.experience} years of professional contributions in the domain.
`,
      atsScore: 78,
      feedback: "Great resume structure. To hit 90+, add quantitative achievements (e.g. 'reduced latency by 20%') and focus on impact."
    };
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = `
    You are an expert resume writer and ATS scanner.
    We want to generate or optimize a professional resume in markdown format, evaluate it for ATS compliance, and score it.
    User Profile:
    - Skills: ${profile.skills.join(', ')}
    - Experience: ${profile.experience} years
    - Education: ${JSON.stringify(profile.education)}
    - Career Goals: ${careerGoals}
    - Existing Resume Draft (if any): "${existingResumeText}"

    Create/update the resume in professional Markdown format.
    Also, calculate an ATS score out of 100 and provide constructive feedback.
    Return the output in STRICT JSON format:
    {
      "content": "The generated markdown resume content",
      "atsScore": number (between 0 and 100),
      "feedback": "Detailed ATS optimization suggestions, missing keywords, and formatting recommendations."
    }
    Ensure the JSON is valid and double-quotes are escaped properly inside the markdown text.
  `;

  const result = await model.generateContent(prompt);
  return parseJSONResponse(result.response.text());
};

/**
 * Improve resume description bullet point using AI
 */
export const improveResumeDescription = async (description, industry = '') => {
  const genAI = getAIClient();
  if (!genAI) {
    return `Optimized and refactored the core workflow, resulting in a 15% increase in speed and a 10% improvement in performance using React.js and backend optimizations.`;
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = `
    You are an expert resume writer.
    Optimize the following professional description/bullet-point to be more professional, impactful, and action-oriented.
    Follow the STAR format and use strong action verbs and include metrics if applicable.
    If possible, incorporate industry standard keywords for "${industry}".
    
    Original Description:
    "${description}"
    
    Return ONLY the improved description as plain text (no markdown formatting, no JSON, no quotes around the response, no introductory text).
  `;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};

