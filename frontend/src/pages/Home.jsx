import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">Master the ATS.<br />Land Your Dream Job.</h1>
        <p className="hero-subtitle">
          Get instant AI-driven feedback, match your resume with job descriptions,
          and boost your interview chances by up to 3x.
        </p>
        <Link to="/upload" className="cta-button">
          Check Your Resume Score
        </Link>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 className="section-title">Why Apply Smart?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Smart Scoring</h3>
            <p>
              Get a detailed score based on industry standards, formatting,
              and content quality to know exactly where you stand.
            </p>
          </div>
          <div className="feature-card">
            <h3>Job Matching</h3>
            <p>
              Compare your resume directly against specific job descriptions
              to ensure a perfect fit for every application.
            </p>
          </div>
          <div className="feature-card">
            <h3>Keyword Optimization</h3>
            <p>
              Identify missing keywords and skills that ATS filters look for,
              ensuring your resume never gets auto-rejected.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Upload</h3>
            <p>Drag and drop your PDF resume into our secure analyzer.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Analyze</h3>
            <p>Our AI scans for structure, keywords, and relevance instantly.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Optimize</h3>
            <p>Get actionable insights and fix issues to beat the ATS.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Apply Smart. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
