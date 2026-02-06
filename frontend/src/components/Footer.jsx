import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="app-footer">
            <div className="footer-content">
                <p>&copy; {new Date().getFullYear()} ApplySmart. All rights reserved.</p>
                <p className="footer-tagline">Empowering careers with AI-driven insights</p>
            </div>
        </footer>
    );
};

export default Footer;
