import React from 'react';
import './Index.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
export default function Landing3() {
  return (
    <section className="how-it-works-section py-5 mb-12">
      <div className="container">
      <div className="d-flex justify-content-center align-items-center">
  <h2 className="text-white fw-bold mb-10 py-2 px-16 rounded-5" style={{ backgroundColor: '#8f5f16'}}> 
    How It Works
  </h2>
</div>        

<div className="row justify-content-center text-center">
          {/* Boxes in a single column */}
         
            {/* Box 1 */}

{/* Box 1 */}
<div className="col-auto mb-2">
  <div className="card step-card">
    <div className="card-body">
      <h5 className="fw-bold">Set the Stage</h5>
      <p className="card-text">Creators launch a Lottery NFT collection, defining the lottery's specific details</p>
    </div>
  </div>
</div>

{/* Arrow 1 */}
<div className="col-auto my-auto">
  <FontAwesomeIcon icon={faArrowRight} size="2x" />
</div>

{/* Box 1 */}
<div className="col-auto mb-2">
  <div className="card step-card">
    <div className="card-body">
      <h5 className="fw-bold">Join the Game</h5>
      <p className="card-text">Participants buy NFT tickets at the creator-determined price, gaining entry to the lottery and a chance to win</p>
    </div>
  </div>
</div>

{/* Arrow 1 */}
<div className="col-auto my-auto">
  <FontAwesomeIcon icon={faArrowRight} size="2x" />
</div>



{/* Box 1 */}
<div className="col-auto mb-2">
  <div className="card step-card">
    <div className="card-body">
      <h5 className="fw-bold">Moment of Luck</h5>
      <p className="card-text">A fair and transparent lucky draw occurs within the set timeframe, where Chainlink VRF determines the random winner</p>
    </div>
  </div>
</div>

{/* Arrow 1 */}
<div className="col-auto my-auto">
  <FontAwesomeIcon icon={faArrowRight} size="2x" />
</div>

              {/* Box 1 */}

{/* Box 1 */}
<div className="col-auto mb-2">
  <div className="card step-card">
    <div className="card-body">
      <h5 className="fw-bold">Fortune's Favor</h5>
      <p className="card-text">The lucky winner secures a creator-defined portion of the collected pot, while a small operational fee supports the Lucky Panda platform's ecosystem</p>
    </div>
  </div>
</div>


              
</div>
</div>
    </section>
  );
};
