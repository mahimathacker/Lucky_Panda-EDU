import React from 'react';
import './Index.css'; // Make sure to create this CSS file and include your styles
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="lucky-panda-footer">
      <div className="container">
        <div className="row align-items-start g-4">
          <div className="col-lg-5">
            <img src="/LuckyPandaLogo.png" alt="Lucky Panda" className="footer-logo" />
            <p className="footer-copy">
              NFT ticket collections, verifiable draws, and creator-led prize pools on-chain.
            </p>
          </div>

          <div className="col-6 col-lg-3">
            <h5>Explore</h5>
            <ul className="footer-links">
              <li><Link to="/create-lottery">Create Lottery</Link></li>
              <li><Link to="/NFT-collections">NFT Readership</Link></li>
              <li><Link to="/lucky-draw-collections">Lucky Draw</Link></li>
            </ul>
          </div>

          <div className="col-6 col-lg-4">
            <h5>Network</h5>
            <p className="footer-copy mb-1">Powered by Sepolia, Chainlink VRF, and Automation.</p>
            <p className="footer-copy mb-0">Use testnet ETH only.</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="small mb-0">&copy; {new Date().getFullYear()} Lucky Panda.</p>
        </div>
      </div>
    </footer>
  );
}
