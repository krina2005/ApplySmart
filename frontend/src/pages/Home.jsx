import { Link } from "react-router-dom";
import {Brain,User,Building2,BarChart3,Zap,Lock,} from "lucide-react";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">
          AI-Powered Resume Evaluation <br />
          Land Your Dream Job Faster
        </h1>
        <p className="hero-subtitle">
          ApplySmart uses advanced AI to match candidates with jobs, rank applications
          intelligently, and provide detailed insights for both job seekers and employers.
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
            <Brain className="feature-icon" />
            <h3>AI-Powered Ranking</h3>
            <p>
              Advanced NLP algorithms analyze resumes against job descriptions,
              providing accurate matching scores based on skills, experience, and fit.
            </p>
          </div>

          <div className="feature-card">
            <User className="feature-icon" />
            <h3>User Dashboard</h3>
            <p>
              Job seekers can browse jobs, apply with one click, and track application
              status with real-time AI feedback.
            </p>
          </div>

          <div className="feature-card">
            <Building2 className="feature-icon" />
            <h3>Company Dashboard</h3>
            <p>
              Employers can post jobs, manage applications, and use AI-powered
              ranking to streamline hiring.
            </p>
          </div>

          <div className="feature-card">
            <BarChart3 className="feature-icon" />
            <h3>Smart Analytics</h3>
            <p>
              Detailed breakdowns of skills match, missing qualifications,
              and experience alignment for every application.
            </p>
          </div>

          <div className="feature-card">
            <Zap className="feature-icon" />
            <h3>Real-Time Updates</h3>
            <p>
              Instant notifications when applications are reviewed, ranked,
              or status changes.
            </p>
          </div>

          <div className="feature-card">
            <Lock className="feature-icon" />
            <h3>Secure & Private</h3>
            <p>
              Enterprise-grade security with Supabase authentication and
              row-level security policies.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2 className="section-title">How ApplySmart Works</h2>

        <div className="workflow-section">
          <h3 className="workflow-title">For Job Seekers</h3>
          <div className="steps-container">
            {[
              ["Create Profile", "Sign up and upload your resume"],
              ["Browse Jobs", "Explore job postings from companies"],
              ["Apply Instantly", "One-click application"],
              ["Track Progress", "Monitor AI scores in real time"],
            ].map((step, i) => (
              <div className="step" key={i}>
                <div className="step-number">{i + 1}</div>
                <h4>{step[0]}</h4>
                <p>{step[1]}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="workflow-section">
          <h3 className="workflow-title">For Companies</h3>
          <div className="steps-container">
            {[
              ["Post Jobs", "Create detailed job listings"],
              ["Receive Applications", "Candidates apply directly"],
              ["AI Ranking", "Automatic candidate ranking"],
              ["Hire Smart", "Make data-driven decisions"],
            ].map((step, i) => (
              <div className="step" key={i}>
                <div className="step-number">{i + 1}</div>
                <h4>{step[0]}</h4>
                <p>{step[1]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Ready to Transform Your Job Search?</h2>
        <p>
          Join thousands of job seekers and employers using AI to make smarter
          hiring decisions.
        </p>
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
          <p className="footer-tagline">Empowering careers with AI-driven insights</p> </div> </footer> 
    </div>
  );
};

export default Home;
