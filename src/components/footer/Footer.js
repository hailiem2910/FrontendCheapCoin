import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Follow CHEAPCOIN On</h3>
            <div className="social-icons">
              <a href="#" className="social-link twitter"></a>
              <a href="#" className="social-link facebook"></a>
              <a href="#" className="social-link instagram"></a>
              <a href="#" className="social-link youtube"></a>
              <a href="#" className="social-link linkedin"></a>
            </div>
          </div>
          
            <div className="footer-section">
              <h3>HELP</h3>
              <ul className="footer-links">
                <li><a href="#">FAQ</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Shipping Policy</a></li>
                <li><a href="#">Returns & Refunds</a></li>
                <li><a href="#">Track Your Order</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>INFORMATION</h3>
              <ul className="footer-links">
                <li><a href="#">About</a></li>
                <li><a href="#">Contact Us</a></li>
                <li><a href="#">Store</a></li>
                <li><a href="#">Investor Relations</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>SHOP</h3>
              <ul className="footer-links">
                <li><a href="#">Figures</a></li>
                <li><a href="#">Accessories</a></li>
              </ul>
            </div>
          
          
        </div>
        
      </div>
      <div className="footer-copyright">
          ©2023 CHEAPCOIN ALL RIGHTS RESERVED
        </div>
    </footer>
  );
};

export default Footer;