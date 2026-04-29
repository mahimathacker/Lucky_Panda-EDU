import React, { useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { LuckyPandaContext } from "../context/LuckyPandaContext";
import { getMetaMaskProvider } from "../context/Web3Context";
import { MarketplaceContractABI, MarketplaceContractAddress } from "../../constants/abi";
import { toast } from "react-toastify";
import { fetchIpfsJson, isSupportedMetadataUri } from "../../utils/ipfsGateway";
const ethers = require("ethers");

export default function AllCollections() {

  const [collections, setCollections] = useState([]);
  const [Img, setImg] = useState([]);

  const luckyPandaContext = useContext(LuckyPandaContext);
  const { collectionUris, getAllCollection } = luckyPandaContext;

  const { address } = useParams();

  function getSoldTokenIds(collectionAddress) {
    const collection = collections.find(
      (item) => item.address.toLowerCase() === collectionAddress.toLowerCase()
    );

    if (!collection || !collection.soldItems) return [];
    if (Array.isArray(collection.soldItems)) {
      return collection.soldItems.map((id) => id.toString());
    }

    return collection.soldItems
      .toString()
      .split(",")
      .filter(Boolean);
  }

  async function purchaseItem(address, tokenID) {
    const ethereum = getMetaMaskProvider();
    if (!ethereum) {
      throw new Error("Please install or enable MetaMask");
    }

    const provider = new ethers.BrowserProvider(ethereum);
    const signer = await provider.getSigner();
    const MarketpaceContract = new ethers.Contract(
      MarketplaceContractAddress,
      MarketplaceContractABI,
      signer
    );
    try {
      const totalPrice = await MarketpaceContract.getTotalPrice(address, tokenID);
      console.log(tokenID, address, totalPrice, "callPurchaseArguments");
      console.log(totalPrice, "value");
      toast.info("Confirm NFT ticket purchase in MetaMask");
      const purchaseItemTx = await MarketpaceContract.purchaseItem(address, tokenID, {
        value: totalPrice,
      });

      toast.info("Purchasing NFT ticket...");
      const txReceipt = await purchaseItemTx.wait();
      console.log(txReceipt, "txReceipt");
      if (txReceipt && txReceipt.status === 1) {
        console.log("NFT purchased");
        toast.success("NFT ticket purchased");
        setCollections((currentCollections) =>
          currentCollections.map((collection) => {
            if (collection.address.toLowerCase() !== address.toLowerCase()) {
              return collection;
            }

            const soldItems = Array.isArray(collection.soldItems)
              ? collection.soldItems.map((id) => id.toString())
              : collection.soldItems?.toString().split(",").filter(Boolean) || [];

            return {
              ...collection,
              soldItems: Array.from(new Set([...soldItems, tokenID.toString()])),
            };
          })
        );
      } else {
        console.log("Transaction failed or was dropped");
        toast.error("NFT purchase failed");
      }
    } catch (error) {
      console.error("Transaction submission failed:", error);
      console.log("Error code:", error.code);
      console.log("Error data:", error.data);
      if (error.transaction) {
        console.log("Transaction data:", error.transaction);
      }
      toast.error(error.shortMessage || error.message || "NFT purchase failed");
    }
  }

  useEffect(() => {
    if (address && collectionUris) {
      // Make sure collectionUris is not empty and is an array
      if (Array.isArray(collectionUris) && collectionUris.length > 0) {
        const collectionsForAddress = collectionUris.filter((collection) => {
          return collection.address.toLowerCase() === address.toLowerCase();
        });
        setCollections(collectionsForAddress);
      }
    }
  }, [address, collectionUris]);


  useEffect(() => {
    console.log(collectionUris, "collectionUris")
    if (!Array.isArray(collections) || collections.length === 0) {
      setImg([]);
      return;
    }

    const loadCollections = async () => {
      const localCollections = collections.filter((collection) =>
        isSupportedMetadataUri(collection.uri)
      );

      if (localCollections.length === 0) {
        setImg([]);
        return;
      }

      const images = await Promise.all(
        localCollections
          .map(async (collection) => {
            try {
              const response = await fetchIpfsJson(collection.uri);
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

      setImg(images.filter((item) => item && item.images.length > 0));
    };

    loadCollections();
  }, [collections])
  console.log(collections, "collections");
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
              {i.images.map((img) => {
                const isSold = getSoldTokenIds(i.address).includes(img.tokenID.toString());

                return (
                  <div className="col" key={img.tokenID}>
                    <div className="card h-100 text-center">
                      <img src={img.url} className="card-img-top" alt={`${i.name}'s collection`} style={{ width: '100%', height: 'auto' }} />
                      <div className="card-body">
                        <h5 className="card-title">Ticket Id: {img.tokenID}</h5>
                        <button
                          type="button"
                          className={`btn ${isSold ? 'btn-secondary' : 'btn-outline-success'} mx-auto d-block`}
                          onClick={() => !isSold && purchaseItem(i.address, img.tokenID)}
                          disabled={isSold}
                        >
                          {isSold ? 'Sold Out' : `Buy for ${i.price}`}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
