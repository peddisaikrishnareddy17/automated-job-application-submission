const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const parseResumeForJobSearch = async (resumePath) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not configured.');
        }

        // 1. Read PDF
        const dataBuffer = fs.readFileSync(resumePath);
        const data = await pdfParse(dataBuffer);
        const resumeText = data.text;

        // 2. Setup Gemini
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
        You are an expert technical recruiter and AI assistant.
        Analyze the following resume text and determine the best keyword queries for a job search engine (like LinkedIn or Indeed).
        
        Extract the candidate's top 3-4 primary technical skills or roles.
        Format your strictly as a JSON array of strings, where each string is a highly optimized job search query.
        Do NOT include any markdown formatting, backticks, or other text outside the JSON array.
        
        Example Output:
        ["Software Engineer", "React Developer", "Node.js Developer", "Full Stack Engineer"]
        
        Resume Text:
        ${resumeText.substring(0, 3000)} // Limit text to avoid token overflow
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        // 3. Parse output securely
        try {
            // Remove potential markdown blocks
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const queries = JSON.parse(cleanText);
            if (Array.isArray(queries) && queries.length > 0) {
                return queries;
            }
        } catch (parseError) {
            console.error('Failed to parse Gemini JSON output:', text);
            return null; // Fallback to manual preferences if parsing fails completely
        }

    } catch (error) {
        console.error('Resume parsing failed:', error.message);
        return null; // Graceful degradation
    }
    return null;
};

const parseResumeFullData = async (resumePath) => {
    let resumeText = '';
    try {
        const dataBuffer = fs.readFileSync(resumePath);
        const data = await pdfParse(dataBuffer);
        resumeText = data.text;
    } catch (parseErr) {
        console.error('Failed to read PDF file:', parseErr.message);
        return null;
    }

    try {
        if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY falsey');

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `
        You are an AI assistant. Parse the following resume text and extract the applicant's details into a deeply structured dataset.
        Return ONLY a strictly formatted JSON object with the following keys, and nothing else (no markdown blocks, no backticks). Set the values to null if the information is missing.
        
        {
          "name": "Full Name",
          "email": "Email Address",
          "phone": "Phone Number",
          "address": "City, State or Full Address",
          "linkedin": "LinkedIn Profile URL",
          "portfolio": "Portfolio/GitHub URL",
          "skills": ["Skill 1", "Skill 2"],
          "education": [
            { "degree": "Degree Name", "school": "University Name", "year": "Graduation Year" }
          ],
          "experience": [
            { "job_title": "Role", "company": "Company", "duration": "Dates", "description": "Short summary of work" }
          ]
        }
        
        Resume Text:
        ${resumeText.substring(0, 3000)}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);

    } catch (error) {
        console.warn('Gemini AI processing failed, falling back to regex parser...');
        // Regex Fallback
        const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        const phoneMatch = resumeText.match(/\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/);
        const lines = resumeText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        // Exclude lines that are likely addresses or common header words to find the name
        const possibleNames = lines.slice(0, 5).filter(l => 
            !l.toLowerCase().includes('resume') && 
            !l.toLowerCase().includes('cv') && 
            !l.includes('@') &&
            !/\d/.test(l)
        );
        const nameMatch = possibleNames.length > 0 ? possibleNames[0] : null;

        return {
            name: nameMatch,
            email: emailMatch ? emailMatch[0] : null,
            phone: phoneMatch ? phoneMatch[0] : null,
            address: null,
            linkedin: null,
            portfolio: null,
            skills: [],
            education: [],
            experience: []
        };
    }
};

module.exports = { parseResumeForJobSearch, parseResumeFullData };
