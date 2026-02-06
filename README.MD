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
- 📝 **spaCy NLP**: Advanced text processing and entity recognition
- 🎯 **Multi-Factor Scoring**:
  - Skills Match (40%)
  - Experience Alignment (30%)
  - Contextual Relevance (20%)
  - Keyword Matching (10%)
- 💡 **Google Gemini Integration**: AI-powered insights and recommendations

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 with Vite
- **Styling**: Modern CSS with gradients, glassmorphism, and animations
- **Routing**: React Router DOM v7
- **State Management**: React Hooks
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime subscriptions

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Database**: Supabase (PostgreSQL)
- **AI/NLP**: 
  - Sentence Transformers (`all-MiniLM-L6-v2`)
  - spaCy (`en_core_web_sm`)
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
cd AI_Resume_Evaluation_System
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Download spaCy Model
```bash
python -m spacy download en_core_web_sm
```

#### Environment Variables
Create a `.env` file in the root directory:
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# Google Gemini API
GOOGLE_API_KEY=your_google_gemini_api_key
```

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

1. Create a Supabase project
2. Run the SQL schema files in your Supabase SQL editor:
   - `supabase_schema.sql` - Main database schema
   - `setup_storage.sql` - Storage buckets and policies
   - `fix_rls.sql` - Row Level Security policies
   - `fix_applications_policy.sql` - Application access policies

---

## 📂 Project Structure

```
AI_Resume_Evaluation_System/
├── core_engine/              # Backend Logic
│   ├── main.py              # FastAPI entry point & API routes
│   ├── job_ranker.py        # AI ranking orchestration
│   ├── evaluate.py          # Resume evaluation logic
│   ├── db_client.py         # Supabase client
│   ├── nlp_engine/          # NLP Processing
│   │   ├── embedding_model.py    # Sentence Transformers
│   │   ├── feature_extractor.py  # Skills & experience extraction
│   │   ├── preprocessing.py      # Text cleaning
│   │   └── ranker.py            # Scoring algorithm
│   ├── ai_engine/           # Google Gemini integration
│   └── utils/               # PDF parsing, helpers
├── frontend/                # React Application
│   ├── src/
│   │   ├── components/      # Reusable components (Navbar, Footer)
│   │   ├── pages/          # Page components
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

2. **Skills Extraction** (spaCy NLP)
   - Identifies technical and soft skills
   - Matches against job requirements

3. **Experience Analysis**
   - Extracts years of experience
   - Analyzes job titles and responsibilities

4. **Weighted Scoring**
   ```
   Final Score = (Skills × 0.4) + (Experience × 0.3) + 
                 (Contextual × 0.2) + (Keywords × 0.1)
   ```

### Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **JWT Authentication**: Secure token-based authentication
- **Service Role**: Backend uses service role for AI ranking operations
- **Storage Policies**: Secure resume file access

---

## 🚀 API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login

### Jobs
- `GET /jobs` - List all job postings
- `POST /jobs` - Create new job posting (companies only)

### Applications
- `POST /applications` - Submit job application
- `GET /applications/user/:id` - Get user's applications
- `GET /applications/company/:id` - Get company's applications

### AI Ranking
- `POST /rank-applications` - Trigger AI ranking for a job posting

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

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Sentence Transformers** - For semantic similarity analysis
- **spaCy** - For NLP processing
- **Google Gemini** - For AI-powered insights
- **Supabase** - For backend infrastructure
- **React** - For the frontend framework

---

<div align="center">
  <p>© 2026 ApplySmart. All rights reserved.</p>
  <p><em>Empowering careers with AI-driven insights</em></p>
  <p>Made with ❤️ by the ApplySmart Team</p>
</div>