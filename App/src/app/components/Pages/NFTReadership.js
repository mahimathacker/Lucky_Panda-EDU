import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { LuckyPandaContext } from "../context/LuckyPandaContext";
import { MarketplaceContractABI, MarketplaceContractAddress } from "../../constants/abi";
import { fetchIpfsJson, isSupportedMetadataUri } from "../../utils/ipfsGateway";
const ethers = require("ethers");


export default function NFTReadership() {
  const [Img, setImg] = useState([]);
  const [allTokenIds, setAllTokenIds] = useState();
  const [tokenAddresses, setTokenAddresses] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState('');

  const luckyPandaContext = useContext(LuckyPandaContext);

  const { collectionUris, getAllCollection } = luckyPandaContext;
  useEffect(() => {
    const loadCollectionUris = async () => {
      setLoading(true);
      await getAllCollection();
    };

    loadCollectionUris();
  }, []);

  useEffect(() => {
    console.log(collectionUris, "collectionUris")
    if (!Array.isArray(collectionUris) || collectionUris.length === 0) {
      setImg([]);
      setLoading(false);
      return;
    }

    const loadCollections = async () => {
      setLoading(true);
      const localCollections = collectionUris.filter((collection) =>
        isSupportedMetadataUri(collection.uri)
      );

      if (localCollections.length === 0) {
        setImg([]);
        setLoading(false);
        return;
      }

      const images = await Promise.all(
        localCollections
          .map(async (collection) => {
            try {
              console.log("NFTReadership:fetchingMetadata", collection);
              const response = await fetchIpfsJson(collection.uri);
              console.log("NFTReadership:metadataResponse", {
                gatewayUrl: response.url,
                data: response.data,
                cached: response.cached,
                unavailable: response.unavailable,
              });
              if (!response.data) {
                return {
                  address: collection.address,
                  name: "Lucky Panda Collection",
                  price: "",
                  metadataUnavailable: true,
                  images: [{ tokenID: 0, url: "/LuckyPandaLogo.png" }],
                };
              }

              const imgTokenUrl = Array.isArray(response.data.imgTokenUrl)
                ? response.data.imgTokenUrl
                : [];
              console.log("NFTReadership:imgTokenUrl", {
                address: collection.address,
                count: imgTokenUrl.length,
                imgTokenUrl,
              });

              return {
                address: collection.address,
                name: response.data.name || "Lucky Panda Collection",
                price: response.data.tokenPrice,
                images: imgTokenUrl.length > 0
                  ? imgTokenUrl
                  : [{ tokenID: 0, url: "/LuckyPandaLogo.png" }],
              };
            } catch (err) {
              console.log(err, "error loading collection metadata");
              return {
                address: collection.address,
                name: "Lucky Panda Collection",
                price: "",
                metadataUnavailable: true,
                images: [{ tokenID: 0, url: "/LuckyPandaLogo.png" }],
              };
            }
          })
      );

      const loadedImages = images.filter((item) => item && item.images.length > 0);
      console.log("NFTReadership:loadedCollections", loadedImages);
      setImg(loadedImages);
      setLoading(false);
    };

    loadCollections();
  }, [collectionUris])

  // useEffect(() => {
  //   Img.map(async(i) => {
  //     const provider = new ethers.BrowserProvider(window.ethereum);
  //     const signer = await provider.getSigner();
  //     const MarketpaceContract = new ethers.Contract(
  //       MarketplaceContractAddress,
  //       MarketplaceContractABI,
  //       signer
  //     );
  //     const getWinner = await MarketpaceContract.getCollectionWinner(i.address);
  //     console.log(getWinner,"getWinner");
  //   }) 
  // },[])

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">Explore Collections</h2>
      {loading && (
        <p className="text-center text-muted">Loading..</p>
      )}
      {!loading &&
        collectionUris.some((collection) => isSupportedMetadataUri(collection.uri)) &&
        Img.length === 0 && (
        <p className="text-center text-muted">Collections found, but metadata is unavailable right now.</p>
      )}
      <div className="row g-4">
        {
          Img.map((i) => (
            <div className="col-12 col-md-6 col-lg-4" key={i.address}> {/* Adjust the column sizes as needed */}
              <div className="card h-100">
                <img src={i.images[0].url} className="card-img-top" width='230px' height='230px' alt={`${i.name} collection`} />
                <div className="card-body">
                  <Link to={`/all-collections/${i.address}`} className="nav-link">
                    <h5 className="card-title">{i.name}&apos;s collection</h5>
                    {i.metadataUnavailable && (
                      <p className="card-text text-muted">Metadata is unavailable from IPFS right now.</p>
                    )}
                    <p className="card-text">{i.address}</p>
                  </Link>
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
