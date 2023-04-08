import React from 'react';
import { Card, Text, Link, Popover, Button, Dropdown, Spacer } from "@nextui-org/react";
import { ethers } from "ethers";
import abi from "../contracts/CharacterSale.json";

const CharCardChain = ({ data }) => {
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
      const characterSaleAddress = "0x65aAc97b628AdA288b8302510A01D703968c4F6E";
      const characterSale = new ethers.Contract(characterSaleAddress, abi, signer);
      let chainId;
      if (index === "0") chainId = 10161 // Sepolia
      else if (index === "1") chainId = 10109  // Mumbai
      else if (index === "2") chainId = 10106 // Fuji
      else throw("Invalid index");
      const tx = await characterSale.sendFrom(signerAddress, chainId, signerAddress, data.character.charId);
      await tx.wait();
    }
    catch (err) {
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
                  <Text size="small">Equipped Gold: {data.character.equippedGold}</Text>
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
                  {data.character.currentChain !== "Fuji" && <Dropdown.Item key={2}>Fuji</Dropdown.Item>}
                </Dropdown.Menu>
              </Dropdown>
            </Card.Body>
          </Card>
  )
}
export default CharCardChain;