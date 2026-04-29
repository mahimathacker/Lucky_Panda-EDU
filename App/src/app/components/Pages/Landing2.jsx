import React from 'react';
import './About.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPalette, faTicketAlt, faTrophy, faGear, faLock, faDice } from '@fortawesome/free-solid-svg-icons';

export default function Landing2() {
  return (
    <section id="about" className="py-5">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-5 mb-4 mb-lg-0">
          <div className="about-image">
            <img src="/about.webp" alt="About Lucky Panda" className="img-fluid" />
            </div>
          </div>
          <div className="col-lg-7">
            <h2 className="display-4 fw-bold lh-1 mb-3">Unlock the Thrill of NFTs with Lucky Panda: Your Gateway to Blockchain-based Wins</h2>
            <ul className="list-unstyled">
              <li className="mb-2"><i className="bi bi-check-circle-fill me-2"></i><FontAwesomeIcon icon={faPalette} /> Innovative NFT platform</li>
              <li className="mb-2"><i className="bi bi-check-circle-fill me-2"></i><FontAwesomeIcon icon={faTicketAlt} /> Merge art with lotteries</li>
              <li className="mb-2"><i className="bi bi-check-circle-fill me-2"></i><FontAwesomeIcon icon={faLock} /> Transparent and fair with blockchain technology</li>
              <li className="mb-2"><i className="bi bi-check-circle-fill me-2"></i><FontAwesomeIcon icon={faGear} /> Exclusive digital art ownership with each NFT</li>
              <li className="mb-2"><i className="bi bi-check-circle-fill me-2"></i><FontAwesomeIcon icon={faTrophy} /> Every NFT a potential winning ticket</li>
              <li className="mb-2"><i className="bi bi-check-circle-fill me-2"></i><FontAwesomeIcon icon={faDice} />  Automated draws with Chainlink VRF for fair play</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
