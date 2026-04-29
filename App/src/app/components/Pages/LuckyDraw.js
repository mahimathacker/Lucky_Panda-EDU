import React, {useState, useEffect, useContext} from "react";
import { LuckyPandaContext } from "../context/LuckyPandaContext";
import { Link } from 'react-router-dom';
import { fetchIpfsJson, isSupportedMetadataUri } from "../../utils/ipfsGateway";

export default function LuckyDraw() {

    const [Img, setImg] = useState([]);
  
    const luckyPandaContext = useContext(LuckyPandaContext);
    const {allCollectionUris, getAllContractCollection} = luckyPandaContext;

    useEffect(() => {
        getAllContractCollection();
      }, []);
    
      useEffect(() => {
        if (!Array.isArray(allCollectionUris) || allCollectionUris.length === 0) {
          setImg([]);
          return;
        }

        const loadCollections = async () => {
          const localCollections = allCollectionUris.filter((collection) =>
            isSupportedMetadataUri(collection.uri)
          );

          const images = await Promise.all(
            localCollections.map(async (collection) => {
              const response = await fetchIpfsJson(collection.uri);
              const metadata = response.data || {};
              const imgTokenUrl = Array.isArray(metadata.imgTokenUrl)
                ? metadata.imgTokenUrl
                : [];

              return {
                address: collection.address,
                hasWinner: collection.hasWinner,
                winnerAddress: collection.winnerAddress,
                winningTokenId: collection.winningTokenId,
                allSold: collection.allSold,
                intervalPassed: collection.intervalPassed,
                requestId: collection.requestId,
                hasPendingRequest: collection.hasPendingRequest,
                upkeepReady: collection.upkeepReady,
                name: metadata.name || "Lucky Panda Collection",
                price: metadata.tokenPrice,
                images: imgTokenUrl.length > 0
                  ? imgTokenUrl
                  : [{ tokenID: 0, url: "/LuckyPandaLogo.png" }],
              };
            })
          );

          console.log("Chainlink:LuckyDrawStatus", images);
          setImg(images);
        };

        loadCollections();
      },[allCollectionUris])

    return(
      <div className="container py-5">
      <h2 className="text-center mb-4">And The Winner Is...</h2>
      <div className="row g-4">
        {Img.map((i, index) => (
          <div className="col-12 col-md-6 col-lg-4" key={i.images[0].tokenID}>
            <div className="card h-100 shadow-sm">
              <img src={i.images[0].url} className="card-img-top" alt={`${i.name}'s collection`} />
              <div className="card-body">
                <h5 className="card-title">{i.name}'s Collection</h5>
                <p className="card-text text-muted mb-2">Collection Address: <span className="lucky-address">{i.address}</span></p>
                <div className="card-text mb-3">
                  {i.hasWinner ? (
                    <>
                      <span className="badge rounded-pill bg-success">Winner Declared</span>
                      <div className="mt-2">
                        <p className="mb-1"><strong>Winner:</strong> {i.winnerAddress}</p>
                        <p><strong>Winner Ticket Id:</strong> {i.winningTokenId.toString()}</p>
                      </div>
                    </>
                  ) : i.hasPendingRequest ? (
                    <>
                      <span className="badge rounded-pill bg-info text-dark">VRF Requested</span>
                      <p className="mt-2 mb-0"><strong>Request Id:</strong> {i.requestId}</p>
                    </>
                  ) : i.upkeepReady ? (
                    <span className="badge rounded-pill bg-primary">Ready for Automation</span>
                  ) : (
                    <>
                      <span className="badge rounded-pill bg-warning text-dark">Waiting for upkeep conditions</span>
                      <div className="mt-2 small text-muted">
                        <p className="mb-1">All tickets sold: {i.allSold ? "Yes" : "No"}</p>
                        <p className="mb-0">Result time passed: {i.intervalPassed ? "Yes" : "No"}</p>
                      </div>
                    </>
                  )}
                </div>
                <Link to ={`/all-collections/${i.address}`} className="nav-link">   
                <button className="btn btn-outline-primary w-100 mt-2">View Collection</button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    
    )

}
