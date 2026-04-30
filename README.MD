---
title: ApplySmart
emoji: 📄
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
app_port: 7860
---

# ApplySmart - AI-Powered Job Application Platform


![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat-square&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

<div align="center">
  <h1>🚀 ApplySmart</h1>
  <h3>AI-Powered Resume Evaluation & Job Matching Platform</h3>
  <p><em>Empowering careers with AI-driven insights</em></p>
</div>

---

## 📖 Overview

**ApplySmart** is a comprehensive job application platform that uses advanced AI and NLP to intelligently match candidates with job opportunities. The platform serves both **job seekers** and **employers**, providing AI-powered resume evaluation, automatic candidate ranking, and real-time application tracking.

### Key Highlights
- 🤖 **AI-Powered Ranking**: Advanced NLP algorithms analyze resumes against job descriptions
- 👥 **Dual User System**: Separate dashboards for job seekers and companies
- 📊 **Smart Analytics**: Detailed breakdowns of skills match, experience alignment, and contextual relevance
- ⚡ **Real-Time Updates**: Instant notifications for application status changes
- 🔒 **Enterprise Security**: Supabase authentication with row-level security policies

---

## 🎬 Video Demo

[Watch the full demo video](demo\Apply-smart.mp4)

---

## ✨ Features

### For Job Seekers
- 📝 **Browse Job Postings**: Explore opportunities from verified companies
- 🎯 **One-Click Applications**: Apply instantly with your uploaded resume
- 📊 **AI Evaluation Scores**: Get detailed AI-powered match scores for each application
- 📈 **Application Tracking**: Monitor application status in real-time
- 🔍 **Detailed Feedback**: View skills match, missing qualifications, and improvement suggestions

### For Employers
- 💼 **Job Posting Management**: Create and manage job listings with detailed requirements
- 📥 **Application Management**: View all applications organized by job posting
- 🤖 **AI Candidate Ranking**: Automatically rank applicants using NLP-based analysis
- ✅ **Approve/Reject Workflow**: Streamlined candidate review process
- 📊 **Candidate Analytics**: View detailed evaluation breakdowns for each applicant

### AI Ranking Engine
- 🧠 **Sentence Transformers**: Semantic similarity analysis using `all-MiniLM-L6-v2`
- � **Resume Text Extraction**: PDF parsing and text normalization
- 🎯 **Multi-Factor Scoring**:
  - Skills Match
  - Experience Alignment
  - Contextual Relevance
  - Keyword Matching
- 💡 **Google Gemini Integration**: AI-powered insights and recommendations

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 with Vite
- **Styling**: Modern CSS with gradients and layout utilities
- **Routing**: React Router DOM v7
- **Authentication**: Supabase Auth
- **Data**: Supabase table queries and realtime subscriptions

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Database**: Supabase (PostgreSQL)
- **AI/NLP**: 
  - Sentence Transformers (`all-MiniLM-L6-v2`)
  - Google Gemini AI
- **PDF Processing**: PyPDF2, pdfplumber
- **Server**: Uvicorn (ASGI)

### Database Schema
- **users**: User authentication and profiles
- **companies**: Company profiles and information
- **jobs**: Job postings with requirements
- **applications**: Job applications with resume URLs
- **Storage**: Supabase Storage for resume PDFs

---

## 🏁 Getting Started

### Prerequisites
- **Node.js** v18+
- **Python** 3.10+
- **Supabase Account** ([Create one here](https://supabase.com))
- **Google Gemini API Key** ([Get it here](https://aistudio.google.com/app/apikey))

### 1. Clone the Repository
```bash
git clone https://github.com/krina2005/ApplySmart.git
cd ApplySmart
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

#### Environment Variables
Create a `.env` file in the repository root with:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_google_gemini_api_key
```

> The backend reads Supabase and Gemini credentials from environment variables.

#### Run Backend Server
```bash
uvicorn core_engine.main:app --reload --port 8000
```
Backend will be available at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
# Add your Supabase credentials:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Start development server
npm run dev
```
Frontend will be available at `http://localhost:5173`

### 4. Database Setup

1. Create a Supabase project.
2. Configure tables and storage in your Supabase dashboard.
3. Create the following tables and columns to match the frontend integration:
   - `users`
   - `companies`
   - `jobs`
   - `applications`
4. Configure Supabase Storage for resume PDF uploads.

> Note: This repository does not include SQL schema files. Use Supabase table editor or your own schema scripts.

---

## 📂 Project Structure

```
ApplySmart/
├── config/                  # Environment + Gemini config
│   └── gemini_config.py     # Loads GEMINI_API_KEY
├── core_engine/             # Backend Logic
│   ├── main.py              # FastAPI entry point & API routes
│   ├── job_ranker.py        # Supabase application ranking workflow
│   ├── matcher.py           # Resume / job description matching
│   ├── nlp_engine/          # NLP Processing and ranking
│   │   ├── embedding_model.py    # Embedding generation
│   │   ├── feature_extractor.py  # Feature extraction helpers
│   │   ├── preprocessing.py      # Text cleaning
│   │   └── ranker.py            # Ranking algorithm
│   └── utils/               # PDF parsing and helpers
│       ├── pdf_reader.py
│       └── text_cleaner.py
├── frontend/                # React Application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   └── supabaseClient.js # Supabase client configuration
│   │   │   ├── Home.jsx            # Landing page
│   │   │   ├── UserDashboard.jsx   # Job seeker dashboard
│   │   │   ├── CompanyDashboard.jsx # Employer dashboard
│   │   │   ├── CompanyApplications.jsx # Application management
│   │   │   └── PostJob.jsx         # Job posting form
│   │   └── supabaseClient.js # Supabase configuration
│   └── public/             # Static assets
├── requirements.txt        # Python dependencies
├── .env                   # Environment variables (not in repo)
└── README.md             # This file
```

---

## 🔑 Key Features Explained

### AI Ranking Algorithm

The ranking system uses a multi-factor approach:

1. **Semantic Similarity** (Sentence Transformers)
   - Compares resume and job description embeddings
   - Captures contextual meaning beyond keywords

2. **Text Extraction**
   - Reads resume content from uploaded PDF files
   - Normalizes and cleans extracted text

3. **Experience and Content Matching**
   - Matches resume content against job description content
   - Uses keyword and semantic relevance scoring

4. **Weighted Scoring**
   ```
   Final Score = (Skills × 0.4) + (Experience × 0.3) +
                 (Contextual × 0.2) + (Keywords × 0.1)
   ```

### Security Features

- **Supabase Auth**: Secure user login and session management
- **Token-based access**: Backend actions require valid Supabase auth tokens
- **Storage rules**: Resume access controlled by Supabase storage policies

---

## 🚀 API Endpoints

### Resume & Ranking
- `POST /analyze-resume` — Upload a resume PDF and job description for instant analysis
- `POST /rank-resumes` — Rank multiple resumes against a job description
- `POST /rank-job/{job_id}` — Fetch applications for a job, rank them, and update Supabase with scores

---

## 📸 Screenshots

### User Dashboard
Browse jobs, apply instantly, and track your applications with AI scores.

### Company Dashboard
Manage job postings, view applications, and use AI to rank candidates.

### AI Ranking Results
Detailed breakdown of candidate evaluation with skills match and recommendations.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🙏 Acknowledgments

- **Sentence Transformers** - For semantic similarity analysis
- **Google Gemini** - For AI-powered insights
- **Supabase** - For backend infrastructure and auth
- **FastAPI** - For the backend API framework
- **React** - For the frontend framework

---

<div align="center">
  <p>© 2026 ApplySmart. All rights reserved.</p>
  <p><em>Empowering careers with AI-driven insights</em></p>
  <p>Made with ❤️ by the ApplySmart Team</p>
</div>
