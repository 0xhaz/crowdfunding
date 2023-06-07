import React, { createContext, useState, useContext, useEffect } from "react";
import { ethers } from "ethers";
import Web3Modal, { local } from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { parseCookies, setCookie } from "nookies";

type Account = string | null;
type AccountWeb3Provider = any | null;
type Wallet = boolean;
type Signer = null;

type AccountContextValue = {
  account?: Account;
  accountProvider: AccountWeb3Provider;
  connect: () => void;
};

type AccountProviderProps = {
  children: React.ReactNode;
};

const AccountContext = createContext<AccountContextValue>(
  {} as AccountContextValue
);

export const AccountProvider = ({
  children,
}: AccountProviderProps): JSX.Element => {
  const [account, setAccount] = useState<Account | null>(null);
  const [accountProvider, setAccountProvider] =
    useState<AccountWeb3Provider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);

  const getWeb3Modal = () => {
    const modal = new Web3Modal({
      cacheProvider: false,
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID,
          },
        },
      },
    });
    return modal;
  };

  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) {
      return alert("Please install MetaMask");
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        const account = ethers.utils.getAddress(accounts[0]);
        setAccount(account);
      }

      window.ethereum.on("accountsChanged", (updatedAccounts: string) => {
        const account = ethers.utils.getAddress(updatedAccounts[0]);
        setAccount(account);
      });
    } catch (error) {
      console.error("Error retrieving accounts:", error);
    }
  };

  const connect = async () => {
    try {
      const modal = getWeb3Modal();
      const connection = await modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const accounts = await provider.listAccounts();

      setAccount(accounts[0]);
      setCookie(null, "connectedAccount", accounts[0]);
    } catch (err) {
      console.error(err);
    }
  };

  const getWalletProvider = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      setAccountProvider(provider);
    } else {
      console.log("Please install MetaMask");
    }
  };

  useEffect(() => {
    getWalletProvider();
    checkIfWalletIsConnected();
  }, []);

  return (
    <AccountContext.Provider value={{ account, connect, accountProvider }}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => {
  return useContext(AccountContext);
};
