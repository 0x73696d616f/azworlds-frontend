import React, { useEffect } from 'react';
import { useState } from "react";
import { Card, Text, Link, Popover, Button, Dropdown, Spacer, Input } from "@nextui-org/react";
import { ethers } from "ethers";
import abi from "../contracts/CharacterSale.json";

const CharCardChain = (data) => {
  const [selectedGold, setSelectedGold] = useState(0);

  const sendTo = async (index) => {
    data.setIsLoading(true);
    try {
      const { ethereum } = window;
      if (!ethereum) return;
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length < 0) return;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();
      const characterSaleAddress = process.env.NEXT_PUBLIC_CHARACTER;
      const characterSale = new ethers.Contract(characterSaleAddress, abi, signer);
      let chainId;
      if (index === "0") chainId = 10161 // Sepolia
      else if (index === "1") chainId = 10109  // Mumbai
      else throw ("Invalid index");
      const tx = await characterSale.sendFrom(signerAddress, chainId, signerAddress, data.character.charId, ethers.utils.solidityPack(['uint16', 'uint256'],[1, 200000]), { value: ethers.utils.parseEther("0.3") });
      await tx.wait();
    }
    catch (err) {
      console.log(err);
    }
    data.setIsLoading(false);
  }

  const unequipGold = async () => {
    data.setIsLoading(true);
    try {
      const { ethereum } = window;
      if (!ethereum) return;
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length < 0) return;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const characterSaleAddress = process.env.NEXT_PUBLIC_CHARACTER;
      const characterSale = new ethers.Contract(characterSaleAddress, abi, signer);
      const tx = await characterSale.dropGold(data.character.charId, selectedGold);
      await tx.wait();
    } catch (err) {
      console.log(err);
    }
    data.setIsLoading(false);
  }

  return (
    <Card>
      <Card.Image
        src={data.character.img}
        objectFit="cover"
        alt="Card image background"
      />
      <Card.Body>
        <Text size="small">Char ID: {data.character.charId}</Text>
        <Text size="small">Level: {data.character.level}</Text>
        <Text size="small">Power: {data.character.power}</Text>
        <Text size="small">Chain: {data.character.currentChain}</Text>
        <Popover>
          <Popover.Trigger>
            <Button auto color="warning">Details</Button>
          </Popover.Trigger>
          <Popover.Content>
            <Text size="small">Buy Price: {data.character.buyPrice}</Text>
            <Text size="small">Equipped Items: {data.character.equippedItems.toString()}</Text>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
              <Text size="small">Equipped Gold: {data.character.equippedGold}</Text>
              <Button light auto color="warning" onClick={unequipGold} size="xs">Unequip Gold</Button>
              <Input auto type="number" onChange={(e) => setSelectedGold(e.target.value)} placeholder="Amount" size="xs"></Input>
            </div>
            <Text size="small">Owner: {data.character.owner}</Text>
            <Link color="warning" size="small" href={data.character.url}>Metadata</Link>
          </Popover.Content>
        </Popover>
        <Spacer y={0.5}></Spacer>
        < Dropdown>
          <Dropdown.Button auto color="warning">Go to Chain</Dropdown.Button>
          <Dropdown.Menu color="warning" aria-label="Static Actions" auto onAction={sendTo}>
            {data.character.currentChain !== "Sepolia" && <Dropdown.Item key={0}>Sepolia</Dropdown.Item>}
            {data.character.currentChain !== "Mumbai" && <Dropdown.Item key={1}>Mumbai</Dropdown.Item>}
          </Dropdown.Menu>
        </Dropdown>
      </Card.Body>
    </Card>
  )
}
export default CharCardChain;