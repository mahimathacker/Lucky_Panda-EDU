import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { LuckyPandaContext } from "../context/LuckyPandaContext";
import { fetchIpfsJson, isSupportedMetadataUri } from "../../utils/ipfsGateway";

export default function MyCollection() {

  const luckyPandaContext = useContext(LuckyPandaContext);

  const {mycollectionUris, getAllMyCollection } = luckyPandaContext;

  const [Img, setImg]= useState([]);

    

  useEffect(() => {
    getAllMyCollection();
  }, [])

  useEffect(() => {
    if (!Array.isArray(mycollectionUris) || mycollectionUris.length === 0) {
      setImg([]);
      return;
    }

    const loadCollections = async () => {
      const localCollections = mycollectionUris.filter((collection) =>
        isSupportedMetadataUri(collection.uri)
      );

      const images = await Promise.all(
        localCollections.map(async (collection) => {
          const response = await fetchIpfsJson(collection.uri);
          if (!response.data) return null;

          const imgTokenUrl = Array.isArray(response.data.imgTokenUrl)
            ? response.data.imgTokenUrl
            : [];

          return {
            address: collection.address,
            name: response.data.name || "Lucky Panda Collection",
            price: response.data.tokenPrice,
            images: imgTokenUrl.length > 0
              ? imgTokenUrl
              : [{ tokenID: 0, url: "/LuckyPandaLogo.png" }],
          };
        })
      );

      setImg(images.filter((item) => item && item.images.length > 0));
    };

    loadCollections();
  }, [mycollectionUris])

return(

    <>
 <div className="container py-5">
      <h2 className="text-center mb-4">My Collections</h2>
      <div className="row g-4">
        {
          Img.map((i) => (
            <div className="col-12 col-md-6 col-lg-4" key={i.address}> {/* Adjust the column sizes as needed */}
              <div className="card h-100">
                <img src={i.images[0].url} className="card-img-top" width='230px' height='230px' alt={`${i.name}'s collection`} />
                <div className="card-body">
                  <Link to ={`/all-mycollections/${i.address}`} className="nav-link">   
                    <h5 className="card-title">{i.name}</h5>
                    <p className="card-text">{i.address}</p>
                  </Link>
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>

    </>
)

}
