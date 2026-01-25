# Apply Smart - AI Resume Evaluation System

![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat-square&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![Google Gemini](https://img.shields.io/badge/AI-Google_Gemini-8E75B2?style=flat-square&logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

<div align="center"> 
  <img src="frontend/public/logo.png" alt="Apply Smart Logo" width="200" />
  <h1>Apply Smart</h1>
  <h3>Master the ATS. Land Your Dream Job.</h3>
</div>

**Apply Smart** is an intelligent, AI-powered resume analyzer designed to help job seekers optimize their CVs for Applicant Tracking Systems (ATS). By leveraging the power of **Google Gemini AI**, it compares your resume against specific job descriptions, provides a match score, and offers actionable feedback to increase your interview chances.

---

## 🚀 Features

- **📄 Smart Resume Parsing**: Accurately extracts text from PDF resumes using `pdfplumber`.
- **🎯 Job Matching & Scoring**: Compares your resume skills and keywords against a job description in real-time.
- **⚡ AI Suggestions**: Powered by Google Gemini to identify missing skills, formatting issues, and content improvements.
- **✨ Modern UI/UX**: A sleek, dark-themed "glassmorphism" interface built with React and Vite.
- **🖱️ Drag & Drop**: Intuitive file upload with immediate visual feedback.
- **📊 Detailed Insights**: categorized "Matched" and "Missing" skills visualization.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Vanilla CSS (Variables, Flexbox/Grid, Glassmorphism)
- **Routing**: React Router DOM v7
- **Icons**: React Icons (FaUserCircle, etc.)

### Backend
- **Framework**: FastAPI (Python)
- **AI Model**: Google GenAI (Gemini)
- **PDF Processing**: `pdfplumber`, `PyPDF2`
- **Server**: Uvicorn

---

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- A valid [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### 1. Clone the Repository
```bash
git clone https://github.com/krina2005/ApplySmart.git
cd AI_Resume_Evaluation_System
```

### 2. Backend Setup
Navigate to the root directory and install Python dependencies.

```bash
# It is recommended to create a virtual environment first
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Environment Variables**:
Create a `.env` file in the root directory (or where `python-dotenv` expects it) and add your API key:
```env
GOOGLE_API_KEY=your_google_api_key_here
```

**Run the Server**:
```bash
# Runs the FastAPI server on http://localhost:8000
uvicorn core_engine.main:app --reload
```

### 3. Frontend Setup
Open a new terminal and navigate to the `frontend` folder.

```bash
cd frontend

# Install Node modules
npm install

# Start the development server
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## 📂 Project Structure

```
AI_Resume_Evaluation_System/
├── core_engine/          # Backend Logic
│   ├── main.py           # FastAPI Entry Point
│   ├── matcher.py        # Logic for comparing Resume vs JD
│   ├── utils/            # Helpers (PDF reader, text cleaner)
│   └── ...
├── frontend/             # React Application
│   ├── public/           # Static Assets (Logo, Favicon)
│   ├── src/
│   │   ├── components/   # Reusable UI (Navbar, etc.)
│   │   ├── pages/        # Views (Home, Upload, Login)
│   │   └── ...
├── requirements.txt      # Python Dependencies
└── README.md             # Project Documentation
```

---

## 🛡️ License

This project is licensed under the MIT License.

---

<div align="center">
  <p>© 2026 Apply Smart. All rights reserved.</p>
  <p>Made with ❤️ by the Apply Smart Team</p>
</div>