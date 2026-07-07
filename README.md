
# JobFlow AI - Automated Job Application Assistant

JobFlow AI is a powerful full-stack application designed to automate the tedious parts of your job hunt. It scrapes jobs from top portals like LinkedIn, Naukri, and Indeed, and uses Selenium-based automation to apply on your behalf.

## 🚀 Key Features

- **Multi-Portal Scraping**: Find jobs across LinkedIn, Naukri, and Indeed in one place.
- **Selenium Automation**: Automated "Easy Apply" and form-filling for job applications.
- **Resume Management**: Upload and manage multiple resumes with automated parsing.
- **Smart Preferences**: Set your target job titles, locations, and salary ranges.
- **Real-time Logs**: Monitor application status and automation steps in the dashboard.

## 🏗️ Architecture

```text
+----------------+       +-------------------+       +--------------------+
|  Next.js UI    | <---> |  Express REST API | <---> |   MongoDB (Data)   |
| (App Router)   |       |  (Node.js)        |       +--------------------+
+----------------+       +---------+---------+
                                   |
                                   v
                         +---------+---------+       +--------------------+
                         |   Bull Queue      | <---> |   Redis (Worker)   |
                         | (Redis Backed)    |       +--------------------+
                         +---------+---------+
                                   |
                                   v
                         +---------+---------+
                         | Selenium Runner   |
                         | (Headless Chrome) |
                         +-------------------+
```

## 🛠️ Prerequisites

- **Node.js**: 18.x or higher
- **MongoDB**: 6.x or higher (local or Atlas)
- **Redis**: 7.x or higher
- **Chrome Browser**: Latest version installed

## 🏁 Quick Start

1. **Clone the Repo**
   ```bash
   git clone https://github.com/vardhan4161/automation-form-filling.git
   cd automation-form-filling
   ```

2. **Server Setup**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Update MONGODB_URI, REDIS_URL, and JWT_SECRET in .env
   npm start
   ```

3. **Client Setup**
   ```bash
   cd ..
   npm install
   cp .env.example .env.local
   # Update NEXT_PUBLIC_API_URL in .env.local
   npm run dev
   ```

4. **Access UI**
   Open [http://localhost:3000](http://localhost:3000)

## ⚖️ Disclaimer

This tool is for educational purposes. Automated scraping and application might violate the Terms of Service of certain job portals. Use responsibly.

# automated-job-application-submission-system
Automated Job Application Submission System using React, Node.js, and MongoDB to streamline job search and application processes.
