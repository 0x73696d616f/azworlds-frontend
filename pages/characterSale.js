import { useState, useEffect } from "react";
import abi from "../contracts/CharacterSale.json";
import usdcAbi from "../contracts/USDC.json";
import { ethers } from "ethers";


import Link from "next/link";
import Metamask from "../component/metamask";

const CharacterSale = () => {
  const [haveMetamask, sethaveMetamask] = useState(true);

  const buyCharacter = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const characterSaleAddress = "0x5cfC45e613278C509C653D8d4D5b908798efEf8F";
    const characterSale = new ethers.Contract(characterSaleAddress, abi, signer);
    const usdcAddress = await characterSale.usdc();
    const usdc = new ethers.Contract(usdcAddress, usdcAbi, signer);
    const usdcName = await usdc.name();
    const chainId = await signer.getChainId();
    const validBefore = Math.floor(Date.now() / 1000) + 3600; // Valid for an hour
    const nonce = ethers.BigNumber.from(ethers.utils.randomBytes(32)).toHexString();
    const value = await characterSale.getPrice();
    const data = {
        types: {
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
          ],
          ReceiveWithAuthorization: [
            { name: "from", type: "address" },
            { name: "to", type: "address" },
            { name: "value", type: "uint256" },
            { name: "validAfter", type: "uint256" },
            { name: "validBefore", type: "uint256" },
            { name: "nonce", type: "bytes32" },
          ],
        },
        domain: {
          name: "MockERC20",
          version: "1",
          chainId: chainId,
          verifyingContract: usdcAddress,
        },
        primaryType: "ReceiveWithAuthorization",
        message: {
          from: client.address,
          to: characterSaleAddress,
          value: value.toString(),
          validAfter: 0,
          validBefore: validBefore, // Valid for an hour
          nonce: nonce,
        },
      };
      
    const signature = await window.ethereum.request({
      method: "eth_signTypedData_v4",
      params: [client.address, JSON.stringify(data)],
    });
      
    const v = "0x" + signature.slice(130, 132);
    const r = signature.slice(0, 66);
    const s = "0x" + signature.slice(66, 130);

    const sig = {"v" : v, "r" : r, "s" : s};
    try {
    const tx = await characterSale.buy(client.address, value, 0, validBefore, nonce, sig);
    await tx.wait();
    } catch (error) {
      console.log(error);
    }
  };
  

  const [client, setclient] = useState({
    isConnected: false,
  });

  const checkConnection = async () => {
    const { ethereum } = window;
    if (ethereum) {
      sethaveMetamask(true);
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        setclient({
          isConnected: true,
          address: accounts[0],
        });
      } else {
        setclient({
          isConnected: false,
        });
      }
    } else {
      sethaveMetamask(false);
    }
  };

  const connectWeb3 = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Metamask not detected");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setclient({
        isConnected: true,
        address: accounts[0],
      });
    } catch (error) {
      console.log("Error connecting to metamask", error);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <>
      {/* Navbar */}
      <nav className="fren-nav d-flex">
        <div>
          <h3>MENU_</h3>
        </div>
        <div className="d-flex" style={{ marginLeft: "auto" }}>
          <div>
            <button className="btn connect-btn" onClick={connectWeb3}>
              {client.isConnected ? (
                <>
                  {client.address.slice(0, 4)}...
                  {client.address.slice(38, 42)}
                </>
              ) : (
                <>Connect Wallet</>
              )}
            </button>
          </div>
          <div>
            <Link href="https://twitter.com/asaolu_elijah">
              <button className="btn tw-btn">TW</button>
            </Link>
          </div>
        </div>
      </nav>
      {/* Navbar end */}

      <section className="container d-flex">
        <main>
          <h1 className="main-title">Character Auction🚀</h1>

          {/* ---- */}
          <p>
            {!haveMetamask ? (
              <Metamask />
            ) : client.isConnected ? (
              <>
                <br />
                <h2>You're connected ✅</h2>
                <button
                  onClick={buyCharacter}
                  type="button"
                  className="btn sign-btn"
                >
                  Buy Character
                </button>
              </>
            ) : (
              <>
                <br />
                <button className="btn connect-btn" onClick={connectWeb3}>
                  Connect Wallet
                </button>
              </>
            )}
          </p>
          {/* ---- */}
        </main>
      </section>
    </>
  );
};

export default CharacterSale;
