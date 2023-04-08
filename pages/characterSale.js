import { useState } from "react";
import abi from "../contracts/CharacterSale.json";
import usdcAbi from "../contracts/USDC.json";
import { ethers } from "ethers";
import Layout from "../component/layout";
import styles from "../component/auction.module.css";
import { Input, Grid, Button } from "@nextui-org/react";

const CharacterSale = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [img, setImg] = useState([]);
  const [charId, setCharId] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const upload = async () => {
    let formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('image', img);
    const response = await fetch("/api/store-metadata", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  const buyCharacter = async () => {
    if (typeof window === 'undefined') return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const signerAddress = await signer.getAddress();
    const characterSaleAddress = process.env.NEXT_PUBLIC_CHARACTER;
    const characterSale = new ethers.Contract(characterSaleAddress, abi, signer);
    const usdcAddress = await characterSale.usdc();
    const usdc = new ethers.Contract(usdcAddress, usdcAbi, signer);
    const usdcName = await usdc.name();
    const chainId = await signer.getChainId();
    const validBefore = Math.floor(Date.now() / 1000) + 3600; // Valid for an hour
    const nonce = ethers.BigNumber.from(ethers.utils.randomBytes(32)).toHexString();
    let value = await characterSale.getPrice();
    value = BigInt(value) + BigInt(10000);
    console.log(value);
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
        name: usdcName,
        version: "1",
        chainId: chainId,
        verifyingContract: usdcAddress,
      },
      primaryType: "ReceiveWithAuthorization",
      message: {
        from: signerAddress,
        to: characterSaleAddress,
        value: value.toString(),
        validAfter: 0,
        validBefore: validBefore, // Valid for an hour
        nonce: nonce,
      },
    };

    const signature = await window.ethereum.request({
      method: "eth_signTypedData_v4",
      params: [signerAddress, JSON.stringify(data)],
    });

    const v = "0x" + signature.slice(130, 132);
    const r = signature.slice(0, 66);
    const s = "0x" + signature.slice(66, 130);

    const sig = { "v": v, "r": r, "s": s };
    try {
      const res = await upload();
      console.log(res);
      const tx = await characterSale.buy(signerAddress, value, 0, validBefore, nonce, sig, res.url);
      setIsLoading(true);
      await tx.wait();
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className={styles.bgWrap}>
        <Layout setCharId={setCharId} isLoading={isLoading}></Layout>
        <Grid.Container gap="2" direction='column' style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80%" }}>
          <Grid>
            <Input
              value={name}
              placeholder="Name of the NFT"
              onChange={(e) => setName(e.target.value)}
            ></Input>
          </Grid>
          <Grid>
            <Input
              value={description}
              placeholder="Description for the NFT"
              onChange={(e) => setDescription(e.target.value)}
            ></Input>
          </Grid>
          <Grid>
            <Input
              type="file"
              onChange={(e) => setImg(e.target.files[0])}
            ></Input>
          </Grid>
          <Grid>
            <Button color="warning" onClick={buyCharacter}>Buy</Button>
          </Grid>
        </Grid.Container>
      </div>
    </>
  );
};

export default CharacterSale;
