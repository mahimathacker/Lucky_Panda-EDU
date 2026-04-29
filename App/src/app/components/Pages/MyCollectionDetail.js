import React, { useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { LuckyPandaContext } from "../context/LuckyPandaContext";
import { fetchIpfsJson, isSupportedMetadataUri } from "../../utils/ipfsGateway";

export default function AllCollections() {

  const [myallcollections, setmyallCollections] = useState([]);
  const [Img, setImg] = useState([]);


  const { address } = useParams();
  const luckyPandaContext = useContext(LuckyPandaContext);

  const { mycollectionUris, getAllMyCollection } = luckyPandaContext;

  useEffect(() => {
    getAllMyCollection();
  }, []);

  useEffect(() => {
    if (address && mycollectionUris) {
      // Make sure collectionUris is not empty and is an array
      if (Array.isArray(mycollectionUris) && mycollectionUris.length > 0) {
        const collectionsForAddress = mycollectionUris.filter((collection) => {
          return collection.address.toLowerCase() === address.toLowerCase();
        });
        setmyallCollections(collectionsForAddress);
      }
    }
  }, [address, mycollectionUris]);


  useEffect(() => {
    if (!Array.isArray(myallcollections) || myallcollections.length === 0) {
      setImg([]);
      return;
    }

    const loadCollections = async () => {
      const localCollections = myallcollections.filter((collection) =>
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
  }, [myallcollections])
  console.log(myallcollections, "collections");
  console.log(Img, "Imggg");

  return (
    <>
      <div className="container py-5">
        {Img.map((i) => (
          <div key={i.name}>
            <div className="row justify-content-center mb-5">
              <h2 className="col-12 text-center mb-2 fw-bold">{i.name}</h2>
              <h3 className="col-12 text-center text-muted">{i.address}</h3>
            </div>

            <div className="row row-cols-1 row-cols-md-3 g-4">
              {i.images.map((img) => (
                <div className="col" key={img.tokenID}>
                  <div className="card h-100 text-center">
                    <img src={img.url} className="card-img-top" alt={`${i.name}'s collection`} style={{ width: '100%', height: 'auto' }} />
                    <div className="card-body">
                      <h5 className="card-title">Ticket Id: {img.tokenID}</h5>
                    </div>
                  </div>
                </div>
              )
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
