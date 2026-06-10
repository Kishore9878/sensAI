import { GoogleGenerativeAI } from '@google/generative-ai';

// Pools of mock questions for different industries to use as high-fidelity fallbacks
const techPool = [
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
  },
  {
    question: "What is the output of 'typeof null' in JavaScript?",
    options: ["object", "null", "undefined", "number"],
    answer: "object",
    feedback: "In JavaScript, typeof null is an historical quirk and returns 'object'."
  },
  {
    question: "Which Git command is used to stage changes for a commit?",
    options: ["git add", "git commit", "git push", "git stage"],
    answer: "git add",
    feedback: "git add stages changes for the next commit."
  },
  {
    question: "Which SQL clause is used to filter records based on a condition?",
    options: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"],
    answer: "WHERE",
    feedback: "The WHERE clause is used to filter records before any groupings are made."
  },
  {
    question: "What is a closure in JavaScript?",
    options: ["A function combined with its lexical environment", "A method to close a browser tab", "A way to encrypt passwords", "A syntax for declaring classes"],
    answer: "A function combined with its lexical environment",
    feedback: "A closure gives you access to an outer function's scope from an inner function."
  },
  {
    question: "What does API stand for?",
    options: ["Application Programming Interface", "Advanced Protocol Integration", "Applied Program Instruction", "Automated Process Interface"],
    answer: "Application Programming Interface",
    feedback: "API stands for Application Programming Interface."
  }
];

const financePool = [
  {
    question: "What does EBITDA stand for?",
    options: ["Earnings Before Interest, Taxes, Depreciation, and Amortization", "Earnings Before Income, Taxes, Debt, and Assets", "Equity Balance in Trust, Debt, and Assets", "Every Business Interest and Tax Deduction Allowed"],
    answer: "Earnings Before Interest, Taxes, Depreciation, and Amortization",
    feedback: "EBITDA stands for Earnings Before Interest, Taxes, Depreciation, and Amortization."
  },
  {
    question: "Which financial statement shows a company's financial position at a specific point in time?",
    options: ["Balance Sheet", "Income Statement", "Cash Flow Statement", "Statement of Retained Earnings"],
    answer: "Balance Sheet",
    feedback: "The Balance Sheet lists assets, liabilities, and equity at a specific reporting date."
  },
  {
    question: "What is the primary formula for the accounting equation?",
    options: ["Assets = Liabilities + Equity", "Assets = Liabilities - Equity", "Liabilities = Assets + Equity", "Equity = Liabilities + Assets"],
    answer: "Assets = Liabilities + Equity",
    feedback: "The accounting equation states that a company's total assets are equal to the sum of its liabilities and its shareholders' equity."
  },
  {
    question: "What does ROI stand for?",
    options: ["Return on Investment", "Rate of Interest", "Risk of Inflation", "Return on Income"],
    answer: "Return on Investment",
    feedback: "ROI is a performance measure used to evaluate the efficiency or profitability of an investment."
  },
  {
    question: "Which of the following is considered a current asset?",
    options: ["Inventory", "Land", "Intellectual Property", "Long-term Investments"],
    answer: "Inventory",
    feedback: "Current assets are expected to be converted into cash within one fiscal year. Inventory is a prime example."
  },
  {
    question: "What is liquidity?",
    options: ["The ease with which an asset can be converted into cash", "The total amount of debt a company has", "The rate of company growth", "The amount of dividend paid to shareholders"],
    answer: "The ease with which an asset can be converted into cash",
    feedback: "Liquidity refers to how quickly and easily an asset can be converted into cash without affecting its market price."
  },
  {
    question: "What does P/E ratio stand for?",
    options: ["Price-to-Earnings ratio", "Price-to-Equity ratio", "Profit-to-Expense ratio", "Portfolio-to-Equity ratio"],
    answer: "Price-to-Earnings ratio",
    feedback: "The P/E ratio relates a company's share price to its earnings per share."
  },
  {
    question: "What is a bond?",
    options: ["A debt security where an investor lends money to an entity", "A share in the ownership of a company", "A contract to buy foreign currency", "An agreement between partners to merge"],
    answer: "A debt security where an investor lends money to an entity",
    feedback: "Bonds are debt instruments representing a loan made by an investor to a borrower."
  },
  {
    question: "What is capital budgeting?",
    options: ["The process of planning expenditures on assets whose cash flows are expected to extend beyond one year", "The daily balancing of cash registers", "The preparation of annual tax filings", "The allocation of staff salaries"],
    answer: "The process of planning expenditures on assets whose cash flows are expected to extend beyond one year",
    feedback: "Capital budgeting evaluates long-term investment proposals like buying equipment or building new projects."
  },
  {
    question: "What is inflation?",
    options: ["A general increase in prices and fall in the purchasing value of money", "A decrease in corporate taxes", "The growth of a company's stock price", "A rise in unemployment rates"],
    answer: "A general increase in prices and fall in the purchasing value of money",
    feedback: "Inflation represents the rate at which the general level of prices for goods and services is rising."
  },
  {
    question: "What is diversification in investing?",
    options: ["Spreading investments across various assets to reduce risk", "Investing all capital into a single high-performing stock", "Borrowing money to increase investment size", "Converting all investments into cash immediately"],
    answer: "Spreading investments across various assets to reduce risk",
    feedback: "Diversification helps reduce risk by allocating investments among different financial instruments and industries."
  },
  {
    question: "What does GDP stand for?",
    options: ["Gross Domestic Product", "General Debt Percentage", "Gross Dividend Payout", "Government Deficit Plan"],
    answer: "Gross Domestic Product",
    feedback: "GDP represents the total monetary value of all finished goods and services produced within a country's borders in a specific time period."
  }
];

const healthcarePool = [
  {
    question: "What is HIPAA primarily designed to protect?",
    options: ["Patient health information privacy", "Healthcare provider salaries", "Hospital building construction safety", "Medical equipment manufacturing guidelines"],
    answer: "Patient health information privacy",
    feedback: "HIPAA sets national standards for protecting sensitive patient health information from being disclosed without consent."
  },
  {
    question: "What does EHR stand for in medical records?",
    options: ["Electronic Health Record", "Emergency Hospital Room", "Essential Health Requirement", "Evaluated Heart Rate"],
    answer: "Electronic Health Record",
    feedback: "EHR is a digital version of a patient's paper chart, containing real-time patient-centered records."
  },
  {
    question: "What is triage in a medical setting?",
    options: ["The process of determining the priority of patients' treatments based on the severity of their condition", "A three-drug treatment regimen", "The training of medical interns", "The billing procedure for emergency cases"],
    answer: "The process of determining the priority of patients' treatments based on the severity of their condition",
    feedback: "Triage groups patients by the urgency of their need for medical care to optimize patient outcomes."
  },
  {
    question: "Which organ is responsible for pumping blood throughout the human body?",
    options: ["Heart", "Lungs", "Liver", "Brain"],
    answer: "Heart",
    feedback: "The heart pumps oxygenated blood through the circulatory system to supply organs and tissues."
  },
  {
    question: "What is hypertension?",
    options: ["High blood pressure", "Low blood sugar", "Anxiety disorder", "High cholesterol"],
    answer: "High blood pressure",
    feedback: "Hypertension is a chronic medical condition where the blood pressure in the arteries is persistently elevated."
  },
  {
    question: "What is a chronic disease?",
    options: ["A disease that persists for a long time or constantly recurs", "A disease that is highly contagious", "A disease that can be cured instantly with antibiotics", "A disease that only affects children"],
    answer: "A disease that persists for a long time or constantly recurs",
    feedback: "Chronic diseases require ongoing medical attention or limit activities of daily living for 1 year or more."
  },
  {
    question: "What is the primary role of a physical therapist?",
    options: ["To help patients improve their movement and manage pain", "To prescribe pharmaceutical drugs", "To perform surgical operations", "To administer diagnostic blood tests"],
    answer: "To help patients improve their movement and manage pain",
    feedback: "Physical therapists help patients restore, maintain, and promote optimal physical function and physical fitness."
  },
  {
    question: "What does outpatient care refer to?",
    options: ["Medical procedures or tests that can be done without an overnight stay", "Care provided in rural areas", "Patients who are discharged against medical advice", "Critical care provided in the ICU"],
    answer: "Medical procedures or tests that can be done without an overnight stay",
    feedback: "Outpatient care does not require admission to a hospital or clinical facility overnight."
  },
  {
    question: "What is the primary purpose of a vaccine?",
    options: ["To stimulate the immune system to produce immunity to a specific disease", "To treat active bacterial infections", "To act as a strong pain reliever", "To reduce body temperature during a fever"],
    answer: "To stimulate the immune system to produce immunity to a specific disease",
    feedback: "Vaccines protect individuals from disease by training their immune system to recognize and fight pathogens."
  },
  {
    question: "What is medical coding?",
    options: ["The transformation of healthcare diagnoses, procedures, and equipment into universal alphanumeric codes", "Writing computer software for medical devices", "Encrypting patient emails", "Formulating clinical trials"],
    answer: "The transformation of healthcare diagnoses, procedures, and equipment into universal alphanumeric codes",
    feedback: "Medical coding translates clinical documentation into standard codes used for billing and tracking."
  },
  {
    question: "What does ICU stand for?",
    options: ["Intensive Care Unit", "Internal Clinical Unit", "Immediate Care Center", "Institutional Care Ward"],
    answer: "Intensive Care Unit",
    feedback: "ICU provides intensive treatment and monitoring for patients with severe or life-threatening illnesses or injuries."
  },
  {
    question: "What is preventative care?",
    options: ["Healthcare services aimed at preventing illnesses and detecting health problems early", "Treatment administered after a disease has spread", "Alternative medicine practices", "Emergency medical transport services"],
    answer: "Healthcare services aimed at preventing illnesses and detecting health problems early",
    feedback: "Preventative care includes screenings, check-ups, and patient counseling to prevent illness or disease."
  }
];

const marketingPool = [
  {
    question: "What does SEO stand for?",
    options: ["Search Engine Optimization", "Social Engagement Organization", "Sales Efficiency Operation", "Systematic Email Outreach"],
    answer: "Search Engine Optimization",
    feedback: "SEO stands for Search Engine Optimization, improving traffic visibility in search engines."
  },
  {
    question: "What is CTR in digital marketing?",
    options: ["Click-Through Rate", "Cost-To-Run", "Customer Transition Ratio", "Conversion Target Route"],
    answer: "Click-Through Rate",
    feedback: "CTR is the ratio of users who click on a specific link to the number of total users who view a page, email, or advertisement."
  },
  {
    question: "What does B2B stand for?",
    options: ["Business-to-Business", "Brand-to-Buyer", "Business-to-Buyer", "Budget-to-Business"],
    answer: "Business-to-Business",
    feedback: "B2B represents commerce transactions conducted between two companies."
  },
  {
    question: "What is a call to action (CTA)?",
    options: ["An instruction designed to prompt an immediate response from the user", "A phone call scheduled with a client", "A company meeting to resolve a crisis", "An advertising regulation"],
    answer: "An instruction designed to prompt an immediate response from the user",
    feedback: "CTAs are elements like buttons or links that urge visitors to take a desired action (e.g., 'Sign Up Now')."
  },
  {
    question: "What is A/B testing in marketing?",
    options: ["Comparing two versions of a webpage or app to see which performs better", "Testing product grade levels", "Evaluating employees in two different teams", "Surveying target audiences before and after a launch"],
    answer: "Comparing two versions of a webpage or app to see which performs better",
    feedback: "A/B testing evaluates variation performance by presenting them randomly to site traffic groups."
  },
  {
    question: "What does PPC stand for?",
    options: ["Pay-Per-Click", "Price-Per-Customer", "Product Promotion Cost", "Public Relations Campaign"],
    answer: "Pay-Per-Click",
    feedback: "PPC is an internet advertising model used to drive traffic to websites, where an advertiser pays a publisher when the ad is clicked."
  },
  {
    question: "What is the marketing funnel?",
    options: ["The model illustrating the customer journey from awareness to purchase", "The channel used to distribute physical goods", "A tool to measure corporate expenses", "The hierarchy of marketing department staff"],
    answer: "The model illustrating the customer journey from awareness to purchase",
    feedback: "The marketing funnel maps the phases prospective customers go through prior to making a buying decision."
  },
  {
    question: "What is influencer marketing?",
    options: ["Partnering with popular social media creators to promote products", "Lobbying government officials for favorable regulations", "Running television advertisements during prime time", "Publishing articles in scientific journals"],
    answer: "Partnering with popular social media creators to promote products",
    feedback: "Influencer marketing leverages key online creators to build brand alignment and boost sales."
  },
  {
    question: "What does ROI stand for in marketing?",
    options: ["Return on Investment", "Reach of Influencer", "Rate of Interest", "Retail Output Index"],
    answer: "Return on Investment",
    feedback: "ROI measures the gain or loss generated on a marketing investment relative to its costs."
  },
  {
    question: "What is content marketing?",
    options: ["Creating and distributing valuable, relevant content to attract a defined audience", "Buying ad space on billboards", "Conducting telemarketing calls", "Packaging products attractively"],
    answer: "Creating and distributing valuable, relevant content to attract a defined audience",
    feedback: "Content marketing focuses on building audience trust and conversion by providing helpful, non-promotional content."
  },
  {
    question: "What is a demographic segment?",
    options: ["Grouping audiences based on characteristics like age, gender, income, and education", "Dividing customers by their typing speed", "Categorizing products by their size", "Sorting email subscribers alphabetically"],
    answer: "Grouping audiences based on characteristics like age, gender, income, and education",
    feedback: "Demographics group markets by physical/socio-economic traits for targeted campaign relevance."
  },
  {
    question: "What does bounce rate measure on a website?",
    options: ["The percentage of visitors who leave the site after viewing only one page", "The time it takes for a page to load completely", "The frequency of server errors", "The speed at which users scroll down a page"],
    answer: "The percentage of visitors who leave the site after viewing only one page",
    feedback: "Bounce rate indicates single-page sessions where the visitor exited without interacting further."
  }
];

const educationPool = [
  {
    question: "What is active learning?",
    options: ["A method of learning where students actively participate in the process", "Reading a textbook silently for hours", "Listening to a lecture without taking notes", "Watching educational videos at double speed"],
    answer: "A method of learning where students actively participate in the process",
    feedback: "Active learning engages students through discussions, problem-solving, and synthesis, rather than passive reception."
  },
  {
    question: "What does pedagogy refer to?",
    options: ["The method and practice of teaching", "The study of children's foot health", "The administrative organization of schools", "The history of classroom furniture design"],
    answer: "The method and practice of teaching",
    feedback: "Pedagogy covers the academic study and practical methods of instructing, coaching, and teaching."
  },
  {
    question: "What is formative assessment?",
    options: ["Ongoing assessments to monitor student learning and provide ongoing feedback", "A final exam at the end of the school year", "A state-mandated standardized test", "A questionnaire for parent feedback"],
    answer: "Ongoing assessments to monitor student learning and provide ongoing feedback",
    feedback: "Formative assessments are qualitative checks used during instruction to guide ongoing student growth."
  },
  {
    question: "What is a lesson plan?",
    options: ["A teacher's detailed description of the course of instruction for a lesson", "A student's weekly study calendar", "A school budget for classroom supplies", "A report card template"],
    answer: "A teacher's detailed description of the course of instruction for a lesson",
    feedback: "Lesson plans list learning objectives, materials, activities, and checks for a specific class day."
  },
  {
    question: "What is cooperative learning?",
    options: ["Students working together in small groups on a structured activity", "Independent homework assignments", "Competitive spelling bees", "Teachers grading exams in pairs"],
    answer: "Students working together in small groups on a structured activity",
    feedback: "Cooperative learning coordinates student teamwork to maximize joint learning achievements."
  },
  {
    question: "What is differentiated instruction?",
    options: ["Tailoring instruction to meet individual student needs", "Using different grading scales for boys and girls", "Teaching two classes at the same time", "Assigning different textbooks every week"],
    answer: "Tailoring instruction to meet individual student needs",
    feedback: "Differentiated instruction adapts teaching processes, content, and products to match diverse learners."
  },
  {
    question: "What is the primary purpose of a rubric?",
    options: ["To communicate expectations and criteria for an assignment", "To keep track of student attendance", "To lock up classroom equipment", "To request funding from the school board"],
    answer: "To communicate expectations and criteria for an assignment",
    feedback: "A rubric is a scoring guide that outlines expectations, criteria, and standard score descriptions."
  },
  {
    question: "What does STEM stand for in education?",
    options: ["Science, Technology, Engineering, and Mathematics", "Social Studies, Theater, English, and Music", "Systematic Training for Educational Mastery", "State-mandated Evaluation Metrics"],
    answer: "Science, Technology, Engineering, and Mathematics",
    feedback: "STEM groups educational fields of Science, Technology, Engineering, and Mathematics."
  },
  {
    question: "What is blended learning?",
    options: ["A style of education in which students learn via electronic and online media as well as traditional face-to-face teaching", "Mixing students of different age groups in one classroom", "Teaching multiple subjects simultaneously", "A physical education class combining different sports"],
    answer: "A style of education in which students learn via electronic and online media as well as traditional face-to-face teaching",
    feedback: "Blended learning combines online digital media with traditional in-person classroom methods."
  },
  {
    question: "What is classroom management?",
    options: ["The wide variety of skills and techniques teachers use to keep students organized, orderly, and attentive", "The cleaning schedule for school janitors", "The process of electing class presidents", "The allocation of classroom lockers"],
    answer: "The wide variety of skills and techniques teachers use to keep students organized, orderly, and attentive",
    feedback: "Classroom management establishes routines, limits disruptions, and sustains student focus on learning."
  },
  {
    question: "What is professional development for educators?",
    options: ["Continuing education and training to keep skills up-to-date", "A student career counseling service", "The promotion path for school principals", "Evaluating school board performance"],
    answer: "Continuing education and training to keep skills up-to-date",
    feedback: "Professional development helps teachers improve pedagogical skills, content mastery, and credentials."
  },
  {
    question: "What is cognitive load theory in education?",
    options: ["The amount of information that working memory can hold at one time", "The physical weight of school textbooks", "The duration of school recess periods", "The rate of student brain growth during adolescence"],
    answer: "The amount of information that working memory can hold at one time",
    feedback: "Cognitive load theory links learning design to the limits and structure of working memory capacity."
  }
];

// Helper to shuffle an array
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

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
  const getMock = () => ({
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
      { role: 'Junior Full Stack Developer', min: 60, max: 90, median: 75, location: 'Remote/US' },
      { role: 'Senior Full Stack Developer', min: 120, max: 180, median: 150, location: 'Remote/US' },
      { role: 'Tech Lead', min: 160, max: 220, median: 190, location: 'Remote/US' }
    ]
  });

  const genAI = getAIClient();
  if (!genAI) {
    return getMock();
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `
      You are an expert career analyst. Generate industry insights for the industry "${industry}".
      Provide the output in STRICT JSON format, with the following keys and data types:
      {
        "growthRate": number (e.g., 7.5),
        "demandLevel": "High" | "Medium" | "Low",
        "topSkills": ["short_skill1", "short_skill2", ...],
        "marketOutlook": "Positive" | "Neutral" | "Negative",
        "keyTrends": ["trend1", "trend2", ...],
        "recommendedSkills": ["skill1", "skill2", ...],
        "salaryRanges": [
          {
            "role": "role name",
            "min": number (salary in thousands, e.g. 80),
            "max": number (salary in thousands, e.g. 155),
            "median": number (salary in thousands, e.g. 120),
            "location": "location name (optional)"
          }
        ]
      }
      Make sure you generate 5 to 6 standard, diverse job roles representing the industry "${industry}". For example, if the industry is related to tech or software, generate standard roles such as Software Engineer, Data Scientist, Frontend Developer, Backend Developer, DevOps Engineer, and Mobile Developer. Make sure the salaries are in thousands (e.g. min: 80, median: 120, max: 155).
      For the "topSkills" list, generate exactly 5 very short, standard industry skill names (each 1 to 2 words maximum, e.g. "React.js", "Docker", "AWS", "Python", "SQL"). Avoid long explanations or descriptive names.
      Ensure the JSON is perfectly valid. Do not write any text outside of the JSON block.
    `;

    const result = await model.generateContent(prompt);
    return parseJSONResponse(result.response.text());
  } catch (error) {
    console.error(`[AI Service Error] generateAIIndustryInsights failed for "${industry}":`, error.message);
    console.log("Falling back to mock industry insights.");
    return getMock();
  }
};

/**
 * Generate Interview Questions
 */
export const generateAIInterviewQuestions = async (industry, role, category) => {
  const getMock = () => {
    const ind = (industry || '').toLowerCase();
    let pool = techPool;
    if (ind.includes('tech') || ind.includes('software') || ind.includes('data') || ind.includes('ai') || ind.includes('developer')) {
      pool = techPool;
    } else if (ind.includes('finance') || ind.includes('bank') || ind.includes('account')) {
      pool = financePool;
    } else if (ind.includes('health') || ind.includes('clinic') || ind.includes('admin') || ind.includes('medical')) {
      pool = healthcarePool;
    } else if (ind.includes('marketing') || ind.includes('digital') || ind.includes('sale')) {
      pool = marketingPool;
    } else {
      pool = educationPool;
    }
    return shuffleArray(pool).slice(0, 10);
  };

  const genAI = getAIClient();
  if (!genAI) {
    return getMock();
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `
      Generate 10 multiple-choice interview questions for a candidate in the industry "${industry}", applying for the role "${role}".
      The interview type/category is "${category}" (e.g. Technical, Behavioral, System Design).
      
      Random seed: ${Math.random()}. Ensure you generate a completely unique, fresh, and randomized set of questions covering different sub-topics. Do not repeat questions from previous runs.
      
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
  } catch (error) {
    console.error(`[AI Service Error] generateAIInterviewQuestions failed for "${role}" in "${industry}":`, error.message);
    console.log("Falling back to mock randomized interview questions.");
    return getMock();
  }
};

/**
 * Evaluate Interview Answers
 */
export const evaluateAIInterviewAnswers = async (questionsAndAnswers) => {
  const getMock = () => ({
    quizScore: 85,
    questions: questionsAndAnswers.map(q => ({
      ...q,
      feedback: "Good attempt. Your answer is correct and covers the main points.",
      isCorrect: true
    })),
    improvementTip: "Practice speaking clearly and focus on structuring your technical explanations."
  });

  const genAI = getAIClient();
  if (!genAI) {
    return getMock();
  }

  try {
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
  } catch (error) {
    console.error(`[AI Service Error] evaluateAIInterviewAnswers failed:`, error.message);
    console.log("Falling back to mock evaluation response.");
    return getMock();
  }
};

/**
 * Generate Cover Letter
 */
export const generateAICoverLetter = async (profile, jobDescription, companyName, jobTitle) => {
  const getMock = () => {
    const skills = Array.isArray(profile.skills) && profile.skills.length > 0 
      ? profile.skills.join(', ') 
      : 'Node.js and PostgreSQL';
    const experience = profile.experience || 4;
    
    return `[Your Name] [Your Address] [Your Phone Number] [Your Email]

[Date]

Hiring Manager ${companyName} [Company Address]

Dear Hiring Manager,

I am writing to express my enthusiastic interest in the ${jobTitle} position at ${companyName}, as advertised on [Platform where you saw the ad – e.g., LinkedIn]. With ${experience} years of experience in software development and a proven track record of innovation, I am confident I possess the skills and drive to significantly contribute to your team.

While the job description specifies key qualifications, my expertise in ${skills} provides a strong foundation for a quick and seamless transition. My experience aligns well with the principles of robust and scalable systems management, a crucial aspect of this role.

In my previous role at [Previous Company Name], I was instrumental in key projects, quantifying achievements whenever possible. For example, I led the development of a major system which resulted in a 20% increase in user engagement and a 15% reduction in server load. This project leveraged my skills in ${skills.split(',')[0] || 'Node.js'} to create a highly efficient and reliable system. My innovative approach to problem-solving involved creating robust architectural designs.

I am a highly motivated and results-oriented individual with a strong understanding of modern development methodologies. I am eager to learn and adapt to new technologies and challenges, and I am confident in my ability to quickly become a valuable asset to your team. My passion for creating efficient and scalable systems aligns perfectly with ${companyName}'s reputation for high-quality software.

Thank you for your time and consideration. I have attached my resume for your review and welcome the opportunity to discuss my qualifications further.

Sincerely,

[Your Name]`;
  };

  const genAI = getAIClient();
  
  const bio = profile.bio || 'Not specified';
  const skills = Array.isArray(profile.skills) ? profile.skills.join(', ') : 'Not specified';
  const experience = profile.experience || 0;
  const education = Array.isArray(profile.education) ? JSON.stringify(profile.education) : 'Not specified';
  const careerGoals = profile.careerGoals || 'Not specified';

  if (!genAI) {
    return getMock();
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `
      Write a tailored, professional cover letter for a candidate applying to the position of "${jobTitle}" at "${companyName}".
      
      Here is the candidate's profile info:
      - Bio: ${bio}
      - Skills: ${skills}
      - Experience: ${experience} years
      - Education: ${education}
      - Career Goals: ${careerGoals}

      Here is the job description:
      "${jobDescription}"

      You MUST format the cover letter EXACTLY as follows (do not use bolding or special markdown on the contact information block or date block):

      [Your Name] [Your Address] [Your Phone Number] [Your Email]

      [Date]

      Hiring Manager ${companyName} [Company Address]

      Dear Hiring Manager,

      <Paragraph 1: Express enthusiastic interest in the "${jobTitle}" position at "${companyName}". Mention that the candidate has ${experience} years of experience and a proven track record of innovation.>

      <Paragraph 2: Map the candidate's skills (${skills}) to the job requirements described in the job description. Highlight how the candidate's background provides a strong foundation for a quick and seamless transition.>

      <Paragraph 3: Describe a previous project or achievement. Use details from the candidate's bio and experience to show how they led a project and achieved a quantifiable result (e.g. reduced load time, improved engagement).>

      <Paragraph 4: State that the candidate is a highly motivated and results-oriented individual. Explain how their passion aligns with ${companyName}'s reputation.>

      <Paragraph 5: Thank them for their time and consideration, mentioning that the resume is attached and looking forward to the opportunity to discuss qualifications further.>

      Sincerely,

      [Your Name]

      Ensure the output is in clean text or standard markdown. Start the output immediately with "[Your Name] [Your Address]...". Do not include any intro, outro, preamble, or conversational remarks.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error(`[AI Service Error] generateAICoverLetter failed for "${jobTitle}" at "${companyName}":`, error.message);
    console.log("Falling back to mock cover letter.");
    return getMock();
  }
};

/**
 * Generate/Optimize Resume and Provide ATS Review
 */
export const generateAIResumeAndATS = async (profile, careerGoals, existingResumeText = '') => {
  const getMock = () => {
    const skillsList = Array.isArray(profile.skills) ? profile.skills : ['React', 'Node.js'];
    const educationList = Array.isArray(profile.education) ? profile.education : [];
    const experienceVal = profile.experience || 0;
    return {
      content: `# ${profile.userId ? 'Professional Resume' : 'Resume'}
## Professional Summary
Experienced specialist with expertise in ${skillsList.slice(0, 3).join(', ')}.

## Core Skills
${skillsList.map(s => `- ${s}`).join('\n')}

## Education
${educationList.map(e => `- ${e.degree} in ${e.fieldOfStudy} at ${e.school} (${e.startYear}-${e.endYear})`).join('\n')}

## Experience
- ${experienceVal} years of professional contributions in the domain.
`,
      atsScore: 78,
      feedback: "Great resume structure. To hit 90+, add quantitative achievements (e.g. 'reduced latency by 20%') and focus on impact."
    };
  };

  const genAI = getAIClient();
  
  const skills = Array.isArray(profile.skills) ? profile.skills.join(', ') : 'Not specified';
  const experience = profile.experience || 0;
  const education = Array.isArray(profile.education) ? JSON.stringify(profile.education) : 'Not specified';
  const goals = careerGoals || 'Not specified';

  if (!genAI) {
    return getMock();
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `
      You are an expert resume writer and ATS scanner.
      We want to generate or optimize a professional resume in markdown format, evaluate it for ATS compliance, and score it.
      User Profile:
      - Skills: ${skills}
      - Experience: ${experience} years
      - Education: ${education}
      - Career Goals: ${goals}
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
  } catch (error) {
    console.error(`[AI Service Error] generateAIResumeAndATS failed:`, error.message);
    console.log("Falling back to mock resume & ATS score.");
    return getMock();
  }
};

/**
 * Improve resume description bullet point using AI
 */
export const improveResumeDescription = async (description, industry = '') => {
  const getMock = () => `Optimized and refactored the core workflow, resulting in a 15% increase in speed and a 10% improvement in performance using React.js and backend optimizations.`;

  const genAI = getAIClient();
  if (!genAI) {
    return getMock();
  }

  try {
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
  } catch (error) {
    console.error(`[AI Service Error] improveResumeDescription failed:`, error.message);
    console.log("Falling back to mock description improvement.");
    return getMock();
  }
};
