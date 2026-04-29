import React, { createContext, useEffect, useState } from "react";
// import { ethers } from "ethers";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
const ethers = require("ethers") 
export const Web3Context = createContext(undefined);

const SEPOLIA_CHAIN_ID = "0xaa36a7";
const SEPOLIA_PARAMS = {
  chainId: SEPOLIA_CHAIN_ID,
  chainName: "Sepolia",
  nativeCurrency: {
    name: "Sepolia ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.sepolia.org"],
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
};

export const getMetaMaskProvider = () => {
  if (typeof window === "undefined") return null;

  if (window.ethereum?.providers) {
    return window.ethereum.providers.find((provider) => provider.isMetaMask);
  }

  if (window.ethereum?.isMetaMask) {
    return window.ethereum;
  }

  return null;
};

export const Web3ContextProvider = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [address, setAddress] = useState();
  const [update, setUpdate] = useState(false);
  const [aLoading, setaLoading] = useState(false);

  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  let add = localStorage.getItem("address");

  const switchToSepolia = async () => {
    const ethereum = getMetaMaskProvider();
    if (!ethereum) {
      alert("Please install or enable MetaMask.");
      return;
    }

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (err) {
      if (err.code === 4902) {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [SEPOLIA_PARAMS],
        });
      } else {
        throw err;
      }
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const ethereum = getMetaMaskProvider();
      if (!ethereum) return;

      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();

      setProvider(provider);
      setSigner(signer);

      const accounts = await ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length > 0) {
        setAddress(accounts[0]);
      }
    };

    if (add) {
      initialize();
    }
  }, [add]);

  

 

  const connectWallet = async () => {
    const ethereum = getMetaMaskProvider();
    setaLoading(true);

    if (!ethereum) {
      alert("Please install or enable MetaMask.");
      setaLoading(false);
      return;
    }
    try {
      await switchToSepolia();
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setAddress(accounts[0]);
      window.localStorage.setItem("address", accounts[0]);
      setUpdate(!update);
      toast.success("Wallet connected");
      setaLoading(false);
    } catch (err) {
      setaLoading(false);
      if (err.code === 4902) {
        try {
          setaLoading(true);
          await switchToSepolia();
          const accounts = await ethereum.request({
            method: "eth_requestAccounts",
          });
          setAddress(accounts[0]);
          window.localStorage.setItem("address", accounts[0]);
          setUpdate(!update);
          toast.success("Wallet connected");
          setaLoading(false);
        } catch (err) {
          setaLoading(false);
          toast.error(err.message);
        }
      }
    }
  };


  const disconnectWallet = () => {
    navigate("/");
    window.localStorage.removeItem("address");
    setUpdate(!update);
    toast.info("Wallet disconnected");
    window.location.reload();
  };

  const shortAddress = (addr) =>
    addr.length > 10 && addr.startsWith("0x")
      ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
      : addr;



  return (
    <Web3Context.Provider
      value={{
        connectWallet,
        switchToSepolia,
        shortAddress,
        disconnectWallet,
        setUpdate,
        address,
        update,
        aLoading,
      }}
      {...props}
    >
      {props.children}
    </Web3Context.Provider>
  );
};
