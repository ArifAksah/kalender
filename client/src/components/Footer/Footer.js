import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h3 className="footer-logo">✏️ Progres Tracker</h3>
          <p className="footer-tagline">Track your daily progress with ease</p>
        </div>
        
        <div className="footer-links">
          <div className="footer-section">
            <h4>Product</h4>
            <ul>
              <li><a href="/">Dashboard</a></li>
              <li><a href="/todo">Todo List</a></li>
              <li><a href="/analytics">Analytics</a></li>
              <li><a href="/achievements">Achievements</a></li>
              <li><a href="/games">Mini Games</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Account</h4>
            <ul>
              <li><a href="/settings">Settings</a></li>
              <li><a href="/profile">Profile</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Resources</h4>
            <ul>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Help Center</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Documentation</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Community</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Connect</h4>
            <ul>
              <li><a href="#" onClick={(e) => e.preventDefault()}>GitHub</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Twitter</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Discord</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="footer-divider"></div>
        <div className="footer-credits">
          <div className="footer-left">
            <p className="footer-copyright">
              © {currentYear} Progres Tracker. All rights reserved.
            </p>
            <p className="footer-powered">
              Powered by <span className="exmine-brand">Exmine</span> ✨
            </p>
          </div>
          <div className="footer-right">
            <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
            <span className="footer-separator">•</span>
            <a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a>
            <span className="footer-separator">•</span>
            <a href="#" onClick={(e) => e.preventDefault()}>Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
