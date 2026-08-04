import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
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
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
      const firstLineBreak = cleaned.indexOf('\n');
      const lastLineBreak = cleaned.lastIndexOf('```');
      cleaned = cleaned.substring(firstLineBreak + 1, lastLineBreak).trim();
    }
    // Sometimes gemini might output ```json on the first line
    if (cleaned.startsWith('json')) {
      cleaned = cleaned.substring(4).trim();
    }
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Error parsing Gemini JSON response:", error, "Raw text:", text);
    throw new Error("Invalid response format from AI service");
  }
};

/**
 * Fallback questions pool when Gemini client is unavailable
 */
const fallbackPools = {
  technical: [
    "How do you handle asynchronous operations in your primary programming language, and what are the trade-offs of different approaches?",
    "Can you explain the differences between SQL and NoSQL databases, and when you would choose one over the other?",
    "What is the purpose of caching in web applications, and how would you implement a caching strategy for a high-traffic endpoint?",
    "How do you ensure security in your code? Can you list three common security vulnerabilities and how you prevent them?",
    "What is your approach to debugging a complex performance issue in a production environment?"
  ],
  behavioral: [
    "Tell me about a time when you had a disagreement with a team member. How did you handle it, and what was the resolution?",
    "Describe a project you worked on where you took complete ownership from start to finish. What was the outcome?",
    "Can you tell me about a time when a project's requirements changed mid-way through development? How did you adapt?",
    "Describe a situation where you had to lead a project or initiative under a tight deadline. What challenges did you face?",
    "Tell me about a time when you made a mistake or failed to meet an expectation. What actions did you take, and what did you learn?"
  ],
  system_design: [
    "Design a URL shortening service like Bit.ly. What database schema and caching strategy would you use to handle high write/read loads?",
    "How would you design a real-time notification system that can scale to send push notifications, emails, and SMS to millions of users?",
    "Explain how you would design a chat application like Slack. What protocols and database structures would you use for real-time messaging?",
    "How would you design a rate limiter for a public API? What algorithms and distributed datastores would you consider?",
    "Explain how you would design a system that serves static assets globally with low latency, high availability, and secure delivery."
  ],
  general: [
    "Tell me about yourself and walk me through your professional background.",
    "What are your short-term and long-term career goals, and how does this role fit into them?",
    "What do you consider to be your greatest professional achievement, and why was it significant?",
    "What are your key strengths, and what is one area of weakness you are actively working to improve?",
    "Why are you interested in this specific role and our industry, and what unique value do you bring?"
  ],
  hr: [
    "Tell me about yourself and walk me through your background and interest in our role.",
    "Why should we hire you for this role? What unique strengths do you bring?",
    "What are your short and long term career goals, and how does this position align with them?",
    "Describe a significant challenge or mistake you faced at work, and how you managed it.",
    "How do you handle high pressure or tight deadlines in a team environment?"
  ],
  core_subjects: [
    "Explain the difference between a process and a thread, and how memory sharing works between them.",
    "What are the ACID properties in databases, and why is the Isolation property particularly important?",
    "Explain how paging works in an operating system's virtual memory management.",
    "Describe the TCP three-way handshake protocol and explain why UDP does not require it.",
    "How does the Domain Name System (DNS) translate human-readable names to IP addresses?"
  ],
  resume: [
    "Please walk me through one of the key projects listed on your resume and explain the main architectural challenges you faced.",
    "Explain the responsibilities and technical stack of one of your internships or professional roles listed.",
    "Why did you choose the specific database or tools used in your primary project?",
    "What was the most challenging technical bug you resolved in your projects, and how did you debug it?",
    "Explain how your skills and coursework listed on your resume prepare you for this role."
  ]
};

/**
 * Generate a descriptive question using Gemini or fallback
 */
export const generateMockInterviewQuestion = async (profile, category, previousQAs = [], subject = '', resumeData = null) => {
  const cat = (category || 'technical').toLowerCase();
  
  const getMock = () => {
    const pool = fallbackPools[cat] || fallbackPools.technical;
    const usedIndex = previousQAs.length;
    return {
      question: pool[usedIndex % pool.length]
    };
  };

  const genAI = getAIClient();
  if (!genAI) {
    return getMock();
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const skillsString = Array.isArray(profile.skills) ? profile.skills.join(', ') : profile.skills || 'None specified';
    const role = profile.role || profile.careerGoals || 'Professional Developer';
    const industry = profile.industry || 'Technology';

    let categoryInstructions = '';
    if (cat === 'technical') {
      categoryInstructions = `
        The interview category is TECHNICAL.
        Generate a technical interview question based on:
        - Target Role: "${role}"
        - Industry: "${industry}"
        - Candidate Skills: ${skillsString}
        
        The question must be open-ended, requiring a descriptive answer.
        Make the question progressively harder if the previous answers in the history were evaluated positively, or keep it basic/intermediate if they struggled.
      `;
    } else if (cat === 'behavioral') {
      categoryInstructions = `
        The interview category is BEHAVIORAL.
        Generate a STAR-based behavioral question (covering Leadership, Communication, Conflict Resolution, Teamwork, Ownership, Decision Making, Problem Solving, Adaptability, or Time Management).
        Make sure to cover a different sub-topic than the ones already covered in the history.
      `;
    } else if (cat === 'system_design') {
      categoryInstructions = `
        The interview category is SYSTEM DESIGN.
        Generate a system design and architecture question (covering scalability, distributed systems, caching, microservices, databases, load balancers, or APIs).
        Tailor the complexity to the candidate's target role "${role}".
      `;
    } else if (cat === 'hr') {
      categoryInstructions = `
        The interview category is HR.
        Generate a descriptive HR interview question:
        - Core focus: Tell me about yourself, why should we hire you, why this company, career goals, strengths/weaknesses, leadership traits, or handling key challenges.
        - The question should be conversational, encouraging descriptive, situational professional storytelling.
      `;
    } else if (cat === 'core_subjects') {
      categoryInstructions = `
        The interview category is CORE SUBJECTS.
        The selected subject is: "${subject || 'Operating System'}".
        Generate an open-ended, descriptive interview question strictly based on the subject: "${subject || 'Operating System'}".
        Cover OOP principles, database ACID/normalization, process scheduling, virtual memory, TCP handshake, or DNS.
        Make the question progressively deeper or more challenging than the previous questions in the history.
      `;
    } else if (cat === 'resume') {
      const resumeStr = resumeData ? JSON.stringify(resumeData) : 'No resume details provided';
      categoryInstructions = `
        The interview category is RESUME-BASED.
        Extracted Resume Details:
        ${resumeStr}
        
        Generate a descriptive interview question directly sourced from the candidate's resume (e.g. projects, experiences, tools, internships).
        Ask them to explain how they implemented a feature, solved a challenge, why they chose a specific technology (e.g. MongoDB), or what their role responsibilities were.
        If there is history, ask a follow-up question that drills deeper into their previous answers (e.g. if they mentioned a database, ask how they scaled it or handled transactions).
      `;
    } else {
      categoryInstructions = `
        The interview category is GENERAL.
        Generate a career/resume-based question (e.g. Tell me about yourself, resume details, career goals, strengths/weaknesses, achievements, conflicts, or role motivation).
      `;
    }

    const prompt = `
      You are an expert AI Interviewer conducting a mock interview with a candidate.
      Candidate Profile:
      - Role: ${role}
      - Industry: ${industry}
      - Skills: ${skillsString}
      
      ${categoryInstructions}
      
      Here is the interview history so far:
      ${JSON.stringify(previousQAs.map(qa => ({ question: qa.question, userAnswer: qa.userAnswer })), null, 2)}
      
      Based on this, generate the NEXT single question. It must NOT be a multiple-choice question. It must be a direct, conversational descriptive question. Do NOT duplicate or ask something very similar to any question already in the history.
      
      Provide your output in STRICT JSON format:
      {
        "question": "The question text"
      }
      Ensure there is no text outside the JSON object.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return parseJSONResponse(text);
  } catch (error) {
    console.error(`[Mock AI Service Error] generateMockInterviewQuestion failed:`, error.message);
    return getMock();
  }
};

/**
 * Grade a single answer on multiple dimensions
 */
export const gradeMockInterviewAnswer = async (question, userAnswer) => {
  const getMock = () => {
    const trimmed = (userAnswer || '').trim();
    if (!trimmed) {
      return {
        feedback: "No answer was provided for this question.",
        scores: {
          technicalAccuracy: 1,
          communication: 1,
          problemSolving: 1,
          confidence: 1,
          completeness: 1,
          clarity: 1,
          overallQuality: 1
        }
      };
    }
    const words = trimmed.split(/\s+/).length;
    if (words < 10) {
      return {
        feedback: "Your response is extremely brief. Please provide a more detailed explanation of the concept or project implementation to demonstrate your understanding.",
        scores: {
          technicalAccuracy: 3,
          communication: 3,
          problemSolving: 3,
          confidence: 4,
          completeness: 3,
          clarity: 4,
          overallQuality: 3
        }
      };
    }
    // Default reasonable mock for longer answers
    return {
      feedback: "Your response is clear and covers the topic. To improve, try structuring your answer with more specific examples or quantitative metrics.",
      scores: {
        technicalAccuracy: 7,
        communication: 7,
        problemSolving: 7,
        confidence: 7,
        completeness: 7,
        clarity: 7,
        overallQuality: 7
      }
    };
  };

  if (!userAnswer || userAnswer.trim() === '') {
    return {
      feedback: "No answer was provided for this question.",
      scores: {
        technicalAccuracy: 1,
        communication: 1,
        problemSolving: 1,
        confidence: 1,
        completeness: 1,
        clarity: 1,
        overallQuality: 1
      }
    };
  }

  const genAI = getAIClient();
  if (!genAI) {
    return getMock();
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `
      You are a professional corporate interviewer. Evaluate the candidate's answer to the interview question below.
      
      Question: "${question}"
      Candidate's Response: "${userAnswer}"
      
      Evaluate the response and grade it on these 7 dimensions (score each out of 10, where 10 is outstanding):
      1. Technical Accuracy (evaluate technical correctness or situational reasoning)
      2. Communication Skills (ability to articulate concepts, vocabulary, structure)
      3. Problem Solving (depth of analysis and logical reasoning)
      4. Confidence (assertiveness and directness of response)
      5. Completeness (whether all parts of the question were answered)
      6. Clarity (logical flow and lack of ambiguity)
      7. Overall Quality (general strength of the answer)
      
      Write a brief constructive feedback paragraph (2-3 sentences) detailing the strengths of the response and how they could improve.
      
      Provide the output in STRICT JSON format:
      {
        "feedback": "Your constructive feedback.",
        "scores": {
          "technicalAccuracy": number (1-10),
          "communication": number (1-10),
          "problemSolving": number (1-10),
          "confidence": number (1-10),
          "completeness": number (1-10),
          "clarity": number (1-10),
          "overallQuality": number (1-10)
        }
      }
      Ensure there is no text outside the JSON object.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return parseJSONResponse(text);
  } catch (error) {
    console.error(`[Mock AI Service Error] gradeMockInterviewAnswer failed:`, error.message);
    return getMock();
  }
};

/**
 * Generate final feedback based on all questions and answers
 */
export const generateMockInterviewFinalFeedback = async (category, questionsAndAnswers) => {
  const getMock = () => {
    // Calculate average overall quality score from questionsAndAnswers if available
    let avgScore = 8.2; // default fallback if no questions
    if (Array.isArray(questionsAndAnswers) && questionsAndAnswers.length > 0) {
      let totalQuality = 0;
      let count = 0;
      questionsAndAnswers.forEach(q => {
        if (q.scores && typeof q.scores.overallQuality === 'number') {
          totalQuality += q.scores.overallQuality;
          count++;
        }
      });
      if (count > 0) {
        // overallQuality is out of 10, overallScore is out of 100
        avgScore = (totalQuality / count) * 10;
      }
    }

    let performanceSummary = "Overall, you performed well in this mock interview. Your technical awareness is solid, and you explained concepts clearly. Focus on structure and including quantitative metrics to make your answers stand out.";
    let readiness = "Ready";
    let strengths = [
      "Strong understanding of core engineering and architectural concepts.",
      "Effective explanation of concepts with a clear and structured delivery.",
      "Good problem-solving methodology when breaking down high-traffic systems."
    ];
    let improvements = [
      "Include more concrete examples and quantitative metrics from past projects.",
      "Structure behavioral answers strictly using the STAR format (Situation, Task, Action, Result).",
      "Elaborate more on caching and edge-case scenarios when describing scaling methods."
    ];

    if (avgScore < 40) {
      performanceSummary = "Based on the mock interview, there are significant areas that need improvement. Several questions were either left unanswered or lacked the necessary depth. We recommend reviewing core concepts and practicing structured responses before your next interview.";
      readiness = "Not Ready";
      strengths = [
        "Willingness to take the mock interview and identify current knowledge gaps.",
        "Attempting to go through all questions in the session.",
        "Initial familiarity with some terms related to the interview category."
      ];
      improvements = [
        "Ensure all questions are answered, avoiding empty responses.",
        "Review and study core fundamentals related to the interview category.",
        "Practice explaining project architectures and technical choices clearly."
      ];
    } else if (avgScore < 70) {
      performanceSummary = "You demonstrated a foundational understanding, but there is room for improvement in depth and articulation. Focus on elaborating more on your technical decisions and providing specific examples.";
      readiness = "Needs Improvement";
      strengths = [
        "Good understanding of fundamental concepts.",
        "Clear communication on standard questions.",
        "Structured delivery of responses."
      ];
      improvements = [
        "Provide deeper technical analysis in your answers.",
        "Elaborate on trade-offs and edge cases for design decisions.",
        "Incorporate specific metrics and outcomes of your work."
      ];
    }

    return {
      performanceSummary,
      strengths,
      improvements,
      learningResources: [
        "System Design Primer by Donne Martin (GitHub repository)",
        "Designing Data-Intensive Applications by Martin Kleppmann",
        "The STAR Method Handbook for Behavioral Interviews"
      ],
      recommendedNext: avgScore < 40 ? "Foundational Topic Review & Practice" : "Mock Interview (AI) - System Design Interview",
      difficultyLevel: avgScore < 40 ? "Beginner" : (avgScore < 70 ? "Intermediate" : "Advanced"),
      readiness,
      overallScore: Math.round(avgScore)
    };
  };

  const genAI = getAIClient();
  if (!genAI) {
    return getMock();
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `
      You are an expert career coach conducting a comprehensive evaluation of a candidate's completed mock interview.
      Interview Category: "${category}"
      
      Here is the complete transcript of the interview (questions, user answers, and individual grading scores/feedback):
      ${JSON.stringify(questionsAndAnswers, null, 2)}
      
      Synthesize this data to produce a final interview performance report.
      Include:
      1. A detailed performanceSummary (3-4 sentences of helpful, encouraging, and critical feedback).
      2. Exactly 3 strengths of the candidate.
      3. Exactly 3 improvements the candidate should work on.
      4. Exactly 3 suggested learning resources (articles, courses, books) tailored to their gaps.
      5. recommendedNext (recommended focus or next mock interview style).
      6. difficultyLevel ("Beginner" | "Intermediate" | "Advanced" based on their response depth).
      7. readiness ("Not Ready" | "Needs Improvement" | "Ready" | "Excellent").
      8. overallScore (a unified score from 0 to 100 representing their overall performance. This should align with the average of the graded scores).
      
      Provide the output in STRICT JSON format:
      {
        "performanceSummary": "string",
        "strengths": ["string", "string", "string"],
        "improvements": ["string", "string", "string"],
        "learningResources": ["string", "string", "string"],
        "recommendedNext": "string",
        "difficultyLevel": "Beginner" | "Intermediate" | "Advanced",
        "readiness": "Not Ready" | "Needs Improvement" | "Ready" | "Excellent",
        "overallScore": number (0-100)
      }
      Ensure there is no text outside the JSON object.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return parseJSONResponse(text);
  } catch (error) {
    console.error(`[Mock AI Service Error] generateMockInterviewFinalFeedback failed:`, error.message);
    return getMock();
  }
};
