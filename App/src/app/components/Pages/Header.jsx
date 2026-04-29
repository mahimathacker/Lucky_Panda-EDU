import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faWallet } from '@fortawesome/free-solid-svg-icons';
import { Web3Context } from "../context/Web3Context";
import './Index.css';

export default function Header() {
  const { address, connectWallet, disconnectWallet, shortAddress } = useContext(Web3Context);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setIsDropdownOpen(false);
  };

  return (
    <header>
      <nav className="navbar navbar-expand-lg">
        <div className="container d-flex justify-content-between align-items-center  ">
          <Link to="/" className="navbar-brand">
          <img src="/LuckyPandaLogo.png" alt="LuckyPanda Logo" />
  
          </Link>
          <div className="d-flex flex-row align-items-center">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link to="/create-lottery" className="nav-link">Create Lottery</Link>
              </li>
              
              <li className="nav-item">
                <Link to="/NFT-collections" className="nav-link">NFT Readership</Link>
              </li>
              <li className="nav-item">
                <Link to="/lucky-draw-collections" className="nav-link">Lucky Draw</Link>
              </li>

            </ul>
            {address ? (
              <div className="ms-lg-auto">
                <div className="nav-item dropdown">
                  <button className="btn btn-secondary dropdown-toggle" type="button" id="navbarDropdown" aria-expanded={isDropdownOpen} onClick={handleDropdown}>
                    <FontAwesomeIcon icon={faUser} />
                  </button>
                  <ul className={`dropdown-menu${isDropdownOpen ? ' show' : ''}`} aria-labelledby ="navbarDropdown">
<li><Link className="dropdown-item" to="/my-collections">My Collections</Link></li>
<li><hr className="dropdown-divider" /></li>
<li><p className="dropdown-item" > {shortAddress(address)}</p></li>
<li><hr className="dropdown-divider" /></li>
<li><button className="dropdown-item" onClick={handleDisconnect}>Disconnect</button></li>
</ul>
</div>
</div>
) : (
<button className="btn btn-outline-secondary ms-lg-auto" onClick={connectWallet}>
<FontAwesomeIcon icon={faWallet} />
</button>
)}
</div>
</div>
</nav>
</header>
);
}
