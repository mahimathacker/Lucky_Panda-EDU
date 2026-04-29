import React, { createContext, useState } from "react";
import { toast } from "react-toastify";

import {
  MarketplaceContractAddress,
  MarketplaceContractABI,
  NFTContractABI,
  ChainlinkVRFContract,
  ChinlinkVRFAddress
} from '../../constants/abi';
import { getMetaMaskProvider } from './Web3Context';
import { cacheIpfsJson, createLocalMetadataUri } from "../../utils/ipfsGateway";
const ethers = require("ethers");

export const LuckyPandaContext = createContext();

export const LuckyPandaContextProvider = (props) => {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [tokenPrice, setTokenPrice] = useState("");
  const [tokenQuantity, setTokenQuantity] = useState("");
  const [uploadImg, setUploadedImg] = useState(null);
  const [resultTime, setResultTime] = useState(1);
  const [winnerPercentage, setWinnerPercentage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [AllTokenIds, setAllTokenIds] = useState();
  const [ImgArr, setImgArr] = useState([]);
  const [AllFilesArr, setAllFilesArr] = useState([]);
  const [AllTokenURIs, setAllTokenURIs] = useState([]);
  const [getCollection, setGetCollection] = useState();
  const [collectionUris, setCollectionUris] = useState([]);
  const [soldItems, setSoldItems] = useState([]);
  const [mycollectionUris, setMyCollectionUris] = useState([]);
  const [allCollectionUris, setAllCollectionUris] = useState([]);

  const notify = () => toast.success("NFT collection created successfully");

  const nameEvent = (e) => setName(e.target.value);
  const symbolEvent = (e) => setSymbol(e.target.value);
  const tokenPriceEvent = (e) => setTokenPrice(e.target.value || null);
  const tokenQuantityEvent = (e) => setTokenQuantity(e.target.value);
  const tokenImgEvent = (e) => setUploadedImg(e.target.files ? e.target.files[0] : null);
  const tokenResultTimeEvent = (e) => setResultTime(e.target.value);
  const tokenWinnerPercentageEvent = (e) => setWinnerPercentage(e.target.value);

  const handleImageUpload = async (imageFile) => {
    if (!imageFile) throw new Error("No image file provided");

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Failed to read image"));
      reader.readAsDataURL(imageFile);
    });
  };

  const getMarketplaceContract = async () => {
    const ethereum = getMetaMaskProvider();
    if (!ethereum) {
      throw new Error("Please install or enable MetaMask");
    }

    const provider = new ethers.BrowserProvider(ethereum);
    const network = await provider.getNetwork();

    if (network.chainId !== 11155111n) {
      throw new Error("Please switch MetaMask to Sepolia");
    }

    const code = await provider.getCode(MarketplaceContractAddress);
    if (code === "0x") {
      throw new Error("Marketplace contract not found on this network");
    }

    const signer = await provider.getSigner();
    return new ethers.Contract(
      MarketplaceContractAddress,
      MarketplaceContractABI,
      signer
    );
  };

  const onFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!tokenQuantity || Number(tokenQuantity) <= 0) {
        throw new Error("Token quantity must be greater than zero");
      }
      if (!tokenPrice || Number(tokenPrice) <= 0) {
        throw new Error("Token price must be greater than zero");
      }

      const ethereum = getMetaMaskProvider();
      if (!ethereum) {
        throw new Error("Please install or enable MetaMask");
      }
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      const lotteryContract = await getMarketplaceContract();

      let transactionCreate = await lotteryContract.createToken(
        name,
        symbol,
        resultTime * 60,
        winnerPercentage
      );
      toast.info("Creating NFT collection...");
      let txc = await transactionCreate.wait();
      console.log(txc);

      const tokenCreatedLog = txc.logs
        .map((log) => {
          try {
            return lotteryContract.interface.parseLog(log);
          } catch (error) {
            return null;
          }
        })
        .find((log) => log && log.name === "TokenCreated");
      const collectionAddress = tokenCreatedLog?.args?.tokenAddress;

      if (!collectionAddress) {
        throw new Error("Unable to read new collection address");
      }

      const imageUrl = uploadImg ? await handleImageUpload(uploadImg) : null;
      console.log("LuckyPanda:create:imageUrl", imageUrl);

      const quantity = Number(tokenQuantity);
      const imgTokenUrl = Array.from({ length: quantity }, (_, index) => ({
        tokenID: index,
        url: imageUrl,
      }));

      const metadata = {
        name,
        symbol,
        tokenPrice,
        tokenQuantity,
        resultTime,
        winnerPercentage,
        imgTokenUrl,
        createdAt: new Date().toISOString(),
      };
      console.log("LuckyPanda:create:metadata", metadata);


      const uri = createLocalMetadataUri(collectionAddress.toLowerCase());
      console.log("LuckyPanda:create:metadataURI", uri);
      cacheIpfsJson(uri, metadata);

      notify();

      const setCollectionOfUri = await lotteryContract.setCollectionUri(
        collectionAddress,
        uri
      );
      console.log("LuckyPanda:create:setCollectionUriTx", {
        collectionAddress,
        uri,
        tx: setCollectionOfUri,
      });

      toast.info("Saving collection metadata...");
      await setCollectionOfUri.wait();

      const mintTx = await lotteryContract.bulkMintERC721(
        collectionAddress,
        0,
        quantity
      );
      toast.info("Minting NFT tickets...");
      await mintTx.wait();

      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const collectionContract = new ethers.Contract(
        collectionAddress,
        NFTContractABI,
        signer
      );
      const alreadyApproved = await collectionContract.isApprovedForAll(
        accounts[0],
        MarketplaceContractAddress
      );
      if (!alreadyApproved) {
        toast.info("Approving marketplace to list NFT tickets...");
        const approvalTx = await collectionContract.setApprovalForAll(
          MarketplaceContractAddress,
          true
        );
        await approvalTx.wait();
      }

      const listTx = await lotteryContract.createMarketItem(
        collectionAddress,
        0,
        quantity,
        ethers.parseEther(tokenPrice.toString())
      );
      toast.info("Listing NFT tickets...");
      await listTx.wait();
      toast.success("NFT tickets minted and listed");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error.message || "Failed to create collection");
    } finally {
      setName("");
      setTokenPrice("");
      setTokenQuantity("");
      setSymbol("");
      setUploadedImg(null);
      setLoading(false);
    }
  };

  async function getAllCollection() {
    const ethereum = getMetaMaskProvider();
    if (!ethereum) {
      throw new Error("Please install or enable MetaMask");
    }
    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });
    const MarketpaceContract = await getMarketplaceContract();

    try {
      const allContractAddresses = await MarketpaceContract.getAllCollectionAddresses();
      console.log(allContractAddresses, "allContractAddresses");

      const collectionuris = await Promise.all(
        allContractAddresses.map(async (addrs) => {
          const uri = await MarketpaceContract.getCollectionUri(addrs);
          const soldItems = await MarketpaceContract.getAllSoldItems(addrs);
          return {
            address: addrs,
            uri: uri,
            soldItems: soldItems.map((id) => id.toString()),
          };
        })
      );
      setCollectionUris(collectionuris);
      setSoldItems(soldItems);
    } catch (error) {
      console.error("Error fetching collections:", error);
      toast.error(error.message || "Failed to load collections");
    }
  }

  async function getAllMyCollection() {
    const ethereum = getMetaMaskProvider();
    if (!ethereum) {
      throw new Error("Please install or enable MetaMask");
    }
    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });
    const MarketpaceContract = await getMarketplaceContract();

    try {
      const myCollectionAddresses = await MarketpaceContract.getOwnerContractAddresses();
      const collectionuris = await Promise.all(
        myCollectionAddresses.map(async (addrs) => {
          const uri = await MarketpaceContract.getCollectionUri(addrs);
          return { address: addrs, uri: uri };
        })
      );
      console.log(collectionUris, "colle");

      setMyCollectionUris(collectionuris);
    } catch (error) {
      console.error("Error fetching my collections:", error);
      toast.error(error.message || "Failed to load your collections");
    }
  }

  async function getAllContractCollection() {
    const ethereum = getMetaMaskProvider();
    if (!ethereum) {
      throw new Error("Please install or enable MetaMask");
    }
    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });
    const MarketpaceContract = await getMarketplaceContract();

    try {
      const allContractAddresses = await MarketpaceContract.getAllCollectionAddresses();
      console.log(allContractAddresses);

      const allcollectionuris = await Promise.all(
        allContractAddresses.map(async (addrs) => {
          const uri = await MarketpaceContract.getCollectionUri(addrs);
          const [winnerAddress, winningTokenId] = await MarketpaceContract.getCollectionWinner(addrs);
          const collectionInfo = await MarketpaceContract.collectionInfo(addrs);
          const requestId = await MarketpaceContract.collectionRequestIds(addrs);
          const now = Math.floor(Date.now() / 1000);
          const lastTimeStamp = Number(collectionInfo.lastTimeStamp);
          const updateInterval = Number(collectionInfo.updateInterval);
          const intervalPassed = now - lastTimeStamp > updateInterval;
          const hasWinner = winnerAddress !== '0x0000000000000000000000000000000000000000';
          const hasPendingRequest = requestId.toString() !== "0";
          return {
            address: addrs,
            uri: uri,
            hasWinner: hasWinner,
            winnerAddress: winnerAddress,
            winningTokenId: winningTokenId,
            allSold: collectionInfo.allSold,
            intervalPassed: intervalPassed,
            updateInterval: updateInterval,
            lastTimeStamp: lastTimeStamp,
            requestId: requestId.toString(),
            hasPendingRequest: hasPendingRequest,
            upkeepReady: collectionInfo.allSold && intervalPassed && !hasWinner && !hasPendingRequest
          }
        })
      );
      console.log("Chainlink:collectionStatuses", allcollectionuris);
      setAllCollectionUris(allcollectionuris);

      const winnerCount = allcollectionuris.filter((collection) => collection.hasWinner).length;
      if (winnerCount > 0) {
        toast.success(`${winnerCount} lucky draw result${winnerCount > 1 ? "s are" : " is"} out`);
      } else {
        toast.info("No lucky draw results yet");
      }
    } catch (error) {
      console.error("Error fetching lucky draw results:", error);
      toast.error(error.message || "Failed to load lucky draw results");
    }
  }

  const Item = {
    name: name,
    symbol: symbol,
    price: tokenPrice,
    quantity: tokenQuantity,
    imgURl: uploadImg,
    resultTime: resultTime,
    winnerPercentage: winnerPercentage,
  };

  return (
    <LuckyPandaContext.Provider
      value={{
        ImgArr,
        AllTokenURIs,
        name,
        nameEvent,
        symbol,
        symbolEvent,
        tokenPrice,
        tokenPriceEvent,
        tokenQuantity,
        tokenQuantityEvent,
        resultTime,
        tokenResultTimeEvent,
        uploadImg,
        tokenImgEvent,
        tokenWinnerPercentageEvent,
        winnerPercentage,
        loading,
        onFormSubmit,
        getCollection,
        AllFilesArr,
        getAllCollection,
        collectionUris,
        getAllMyCollection,
        mycollectionUris,
        getAllContractCollection,
        allCollectionUris,
        handleImageUpload,
      }}
    >
      {props.children}
    </LuckyPandaContext.Provider>
  );
};
