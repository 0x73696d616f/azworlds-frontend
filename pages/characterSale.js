import { useState, useEffect } from "react";
import abi from "../contracts/CharacterSale.json";
import { ethers } from "ethers";


import Link from "next/link";
import Metamask from "../component/metamask";

const CharacterSale = () => {
  const [haveMetamask, sethaveMetamask] = useState(true);

  const buyCharacter = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const characterSale = new ethers.Contract("0xf6cCCce87Be6a0cA28867Ab7fE4EF5D3D5d3AABB", abi, provider);
    const data = {
        types: {
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
          ],
          TransferWithAuthorization: [
            { name: "from", type: "address" },
            { name: "to", type: "address" },
            { name: "value", type: "uint256" },
            { name: "validAfter", type: "uint256" },
            { name: "validBefore", type: "uint256" },
            { name: "nonce", type: "bytes32" },
          ],
        },
        domain: {
          name: tokenName,
          version: tokenVersion,
          chainId: selectedChainId,
          verifyingContract: tokenAddress,
        },
        primaryType: "TransferWithAuthorization",
        message: {
          from: userAddress,
          to: recipientAddress,
          value: amountBN.toString(10),
          validAfter: 0,
          validBefore: Math.floor(Date.now() / 1000) + 3600, // Valid for an hour
          nonce: Web3.utils.randomHex(32),
        },
      };
      
      const signature = await ethereum.request({
        method: "eth_signTypedData_v4",
        params: [userAddress, JSON.stringify(data)],
      });
      
      const v = "0x" + signature.slice(130, 132);
      const r = signature.slice(0, 66);
      const s = "0x" + signature.slice(66, 130);


    const estimatedGasLimit = await characterSale.estimateGas.buy(client.address, 10**18); // approves 1 USDT
    const approveTxUnsigned = await characterSale.populateTransaction.approve("SOME_ADDRESS", ethers.utils.parseUnits("10.0", 18), "0", ethers.utils.parseUnits("10.0", 18), 0);
    approveTxUnsigned.chainId = 11155111; // chainId 1 for Ethereum mainnet
    approveTxUnsigned.gasLimit = estimatedGasLimit;
    approveTxUnsigned.gasPrice = await provider.getGasPrice();
    approveTxUnsigned.nonce = await provider.getTransactionCount(walletAddress);

    const approveTxSigned = await signer.signTransaction(approveTxUnsigned);
    const submittedTx = await provider.sendTransaction(approveTxSigned);
    const approveReceipt = await submittedTx.wait();
    if (approveReceipt.status === 0)
        throw new Error("Approve transaction failed");

    try {
      signer.signMessage("Hello World").then((result) => {
        console.log(result);
      });
    } catch (error) {
      // handle error
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
          <h1 className="main-title">Character Sale🚀</h1>

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
