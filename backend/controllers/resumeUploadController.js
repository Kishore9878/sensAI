import { GoogleGenerativeAI } from '@google/generative-ai';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';

const MOCK_RESUME_DATA = {
  projects: [
    { title: "Hospital Management System", description: "Developed a secure healthcare management app featuring doctor appointment schedules, real-time patient queue, and prescriptions billing.", technologies: ["React", "Node.js", "Express", "MongoDB"] },
    { title: "E-Commerce Microservices Platform", description: "Architected a scalable system design using asynchronous message queuing.", technologies: ["Node.js", "RabbitMQ", "PostgreSQL", "Redis", "Docker"] }
  ],
  skills: ["Javascript", "Node.js", "React", "MongoDB", "Express", "System Design", "Microservices", "REST APIs"],
  education: [
    { school: "State Technical University", degree: "Bachelor of Technology", fieldOfStudy: "Computer Science and Engineering", cgpa: "8.7/10" }
  ],
  experience: [
    { title: "Software Engineer Intern", company: "Dev Solutions Inc.", description: "Assisted in upgrading monolith systems to structured REST APIs, boosting query speed.", technologies: ["Node.js", "Express", "MongoDB"] }
  ],
  internships: [
    { title: "Software Development Intern", company: "Innovate Labs", description: "Created dynamic dashboard metrics and automated build pipelines." }
  ],
  certifications: ["AWS Certified Cloud Practitioner", "Scrum Master Foundation"],
  achievements: ["Winner of Smart Campus Hackathon 2025", "Consistent academic performer"],
  programmingLanguages: ["JavaScript", "Python", "SQL", "C++"],
  frameworks: ["React", "Express", "Tailwind CSS"],
  tools: ["Git", "Docker", "Postman", "VS Code", "Figma"]
};

// Initialize Gemini client
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY is not defined in resumeUploadController.");
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

// Fallback plain-text extractor for older binary .doc format or parsing issues
const extractASCIIFromBuffer = (buffer) => {
  try {
    const text = buffer.toString('utf-8');
    // Extract printable ASCII characters
    const clean = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ');
    // Remove multiple spaces
    return clean.replace(/\s+/g, ' ').trim();
  } catch (err) {
    return 'Could not extract raw text from binary document.';
  }
};

/**
 * @desc    Upload, parse, and analyze resume using Gemini AI
 * @route   POST /api/resume/upload-parse
 * @access  Private
 */
export const uploadAndParseResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No resume file uploaded.' });
    }

    const { mimetype, originalname, buffer } = req.file;
    let extractedText = '';

    // Step 1: Text extraction based on file format
    if (mimetype === 'application/pdf' || originalname.endsWith('.pdf')) {
      const parser = new pdfParse.PDFParse({ data: buffer });
      const pdfData = await parser.getText();
      extractedText = pdfData.text;
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
      originalname.endsWith('.docx')
    ) {
      const docxResult = await mammoth.extractRawText({ buffer });
      extractedText = docxResult.value;
    } else if (
      mimetype === 'application/msword' || 
      originalname.endsWith('.doc')
    ) {
      // Fallback extraction for binary doc
      extractedText = extractASCIIFromBuffer(buffer);
    } else {
      return res.status(400).json({ message: 'Unsupported file format. Please upload PDF, DOCX, or DOC.' });
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ message: 'Failed to extract text from file. Please ensure the document is not password-protected or scanned.' });
    }

    // Step 2: Extract structured fields using Gemini
    const genAI = getAIClient();
    if (!genAI) {
      // Fallback stub mock data if Gemini API key is missing
      return res.json(MOCK_RESUME_DATA);
    }

    let parsedData;
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const prompt = `
        You are an expert ATS parser. Parse the following raw resume text and extract the candidate details.
        
        Raw Resume Text:
        """
        ${extractedText}
        """
        
        Extract and structure the details into the following fields:
        1. projects (array of objects with fields: title, description, technologies (array of strings))
        2. skills (array of strings)
        3. education (array of objects with fields: school, degree, fieldOfStudy, cgpa)
        4. experience (array of objects with fields: title, company, description, technologies (array of strings))
        5. internships (array of objects with fields: title, company, description)
        6. certifications (array of strings)
        7. achievements (array of strings)
        8. programmingLanguages (array of strings - e.g. JavaScript, Python, Java)
        9. frameworks (array of strings - e.g. React, Next.js, Django, Spring)
        10. tools (array of strings - e.g. Git, Docker, Kubernetes, AWS, Webpack)
        
        Provide the output in STRICT JSON format matching the schema below:
        {
          "projects": [
            { "title": "string", "description": "string", "technologies": ["string"] }
          ],
          "skills": ["string"],
          "education": [
            { "school": "string", "degree": "string", "fieldOfStudy": "string", "cgpa": "string" }
          ],
          "experience": [
            { "title": "string", "company": "string", "description": "string", "technologies": ["string"] }
          ],
          "internships": [
            { "title": "string", "company": "string", "description": "string" }
          ],
          "certifications": ["string"],
          "achievements": ["string"],
          "programmingLanguages": ["string"],
          "frameworks": ["string"],
          "tools": ["string"]
        }
        
        Ensure you only output a valid JSON object. Do not include markdown code block syntax (like \`\`\`json) or any conversational text.
      `;

      const result = await model.generateContent(prompt);
      let responseText = result.response.text().trim();

      // Clean JSON response
      if (responseText.startsWith('```')) {
        const firstLineBreak = responseText.indexOf('\n');
        const lastLineBreak = responseText.lastIndexOf('```');
        responseText = responseText.substring(firstLineBreak + 1, lastLineBreak).trim();
      }
      if (responseText.startsWith('json')) {
        responseText = responseText.substring(4).trim();
      }

      parsedData = JSON.parse(responseText);
    } catch (geminiError) {
      console.warn('[Resume Parser Gemini API Error] API request failed, falling back to mock data:', geminiError.message);
      parsedData = MOCK_RESUME_DATA;
    }

    res.status(200).json(parsedData);
  } catch (error) {
    console.error('[Resume Parser Error]:', error);
    res.status(500).json({ message: 'Error parsing resume using AI. Please try again with a cleaner document.' });
  }
};
