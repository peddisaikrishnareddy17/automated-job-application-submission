# Automation Setup Guide

## System Overview
This project uses Node.js, Mongoose, and Selenium WebDriver to automate job hunting. It fetches listings from open APIs and utilizes an AI parser integrated with generic Selenium automation to automatically discover and apply to jobs.

## 1. Prerequisites
- **Node.js** v18+
- **MongoDB** running locally or via Atlas.
- **Chrome / ChromeDriver**: Selenium uses Chrome. Ensure you have the latest Chrome browser installed.
- **Google Gemini API Key**: Used for parsing resumes. Set `GEMINI_API_KEY` in your `.env` file.

## 2. Configuration
Create a `.env` file in the `server` directory:
```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/job-automation
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key
USAJOBS_API_KEY=your_usajobs_api_key
LOG_LEVEL=info
```

## 3. How Job APIs Work
The system fetches dynamically from 5 allowed Application APIs: `Arbeitnow`, `RemoteOK`, `Adzuna`, `USAJobs`, and `Greenhouse`. It maps listings to a normalized dataset format that MongoDB ingests natively without modifying legacy schemas. All integrations with restricted sites like LinkedIn, Indeed, and Naukri have been completely removed.

## 4. How Selenium Automation Works
1. User uploads a resume via endpoints; `services/resumeParser.js` extracts explicit details (name, email, phone) utilizing Google Gemini 1.5. This replaces blank or fallback logic and persists strictly into MongoDB.
2. Backend routes fire and fetch fresh jobs through `jobProvider`. 
3. User initiates automation. `runner.js` launches Google Chrome invisibly.
4. The Generic handler navigates to `apply_url`. It detects `hCaptcha` or login credentials and skips unsupported pages automatically.
5. Standard ATS form input tags are located using Regex matching (i.e finding `<input type="tel">` regardless of generic class-names). 
6. Files upload naturally via Absolute path to `input[type="file"]`. Submit buttons fire and Selenium quits context gracefully.

## 5. Locating Logs
Detailed execution events, network interactions, and Selenium metrics are physically written iteratively via Winston to:
- `server/logs/automation.log`

## 6. Running Locally
1. `cd server`
2. `npm install`
3. `npm start`
4. Use provided routes to run through the entire sequence end to end.
