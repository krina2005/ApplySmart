import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">
          AI-Powered Resume Evaluation<br />Land Your Dream Job Faster
        </h1>
        <p className="hero-subtitle">
          ApplySmart uses advanced AI to match candidates with jobs, rank applications intelligently,
          and provide detailed insights for both job seekers and employers.
        </p>
        <div className="hero-buttons">
          <Link to="/login/user" className="cta-button primary">
            Get Started as Job Seeker
          </Link>
          <Link to="/login/company" className="cta-button secondary">
            Post Jobs as Company
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 className="section-title">Complete Job Application Platform</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI-Powered Ranking</h3>
            <p>
              Advanced NLP algorithms analyze resumes against job descriptions, providing
              accurate matching scores based on skills, experience, and contextual fit.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👤</div>
            <h3>User Dashboard</h3>
            <p>
              Job seekers can browse opportunities, apply with one click, and track
              application status with real-time AI evaluation scores and detailed feedback.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏢</div>
            <h3>Company Dashboard</h3>
            <p>
              Employers can post jobs, manage applications, and use AI to rank candidates
              automatically, streamlining the hiring process.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Smart Analytics</h3>
            <p>
              Get detailed breakdowns of skills match, missing qualifications, contextual
              relevance, and experience alignment for every application.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Real-Time Updates</h3>
            <p>
              Instant notifications when applications are reviewed, ranked, or status changes,
              keeping everyone in the loop.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>
              Enterprise-grade security with Supabase authentication and row-level security
              policies protecting all user data.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2 className="section-title">How ApplySmart Works</h2>

        <div className="workflow-section">
          <h3 className="workflow-title">For Job Seekers</h3>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h4>Create Profile</h4>
              <p>Sign up and upload your resume to get started</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h4>Browse Jobs</h4>
              <p>Explore job postings from verified companies</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h4>Apply Instantly</h4>
              <p>One-click application with your uploaded resume</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h4>Track Progress</h4>
              <p>Monitor AI scores and application status in real-time</p>
            </div>
          </div>
        </div>

        <div className="workflow-section">
          <h3 className="workflow-title">For Companies</h3>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h4>Post Jobs</h4>
              <p>Create detailed job descriptions with requirements</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h4>Receive Applications</h4>
              <p>Candidates apply directly through the platform</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h4>AI Ranking</h4>
              <p>Let AI analyze and rank all pending applications</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h4>Hire Smart</h4>
              <p>Review top candidates and make informed decisions</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Transform Your Job Search?</h2>
        <p>Join thousands of job seekers and employers using AI to make smarter hiring decisions</p>
        <div className="cta-buttons">
          <Link to="/login/user" className="cta-button primary">
            Start as Job Seeker
          </Link>
          <Link to="/login/company" className="cta-button secondary">
            Start as Employer
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} ApplySmart. All rights reserved.</p>
          <p className="footer-tagline">Empowering careers with AI-driven insights</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
