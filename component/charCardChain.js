import React from 'react';
import { Card, Text, Link, Popover, Button, Dropdown, Spacer } from "@nextui-org/react";

const CharCardChain = ({ character }) => {
  const sendTo = async (val) => {
    if (typeof window === 'undefined') return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const signerAddress = await signer.getAddress();
    const characterSaleAddress = "0x65aAc97b628AdA288b8302510A01D703968c4F6E";
    const characterSale = new ethers.Contract(characterSaleAddress, abi, signer);
  }

  return (
          <Card>
            <Card.Image
              src={character.img}
              objectFit="cover"
              alt="Card image background"
            />
            <Card.Body>
              <Text size="small">Char ID: {character.charId}</Text>
              <Text size="small">Level: {character.level}</Text>
              <Text size="small">Power: {character.power}</Text>
              <Text size="small">Chain: {character.currentChain}</Text>
              <Popover>
                <Popover.Trigger>
                  <Button auto color="warning">Details</Button>
                </Popover.Trigger>
                <Popover.Content>
                  <Text size="small">Buy Price: {character.buyPrice}</Text>
                  <Text size="small">Equipped Items: {character.equippedItems}</Text>
                  <Text size="small">Equipped Gold: {character.equippedGold}</Text>
                  <Text size="small">Owner: {character.owner}</Text>
                  <Link color="warning" size="small" href={character.url}>Metadata</Link>
                </Popover.Content>
              </Popover>
              <Spacer y={0.5}></Spacer>
              < Dropdown>
                <Dropdown.Button auto color="warning">Go to Chain</Dropdown.Button>
                <Dropdown.Menu color="warning" aria-label="Static Actions" auto onAction={sendTo}>
                  {character.currentChain !== "Sepolia" && <Dropdown.Item key={0}>Sepolia</Dropdown.Item>}
                  {character.currentChain !== "Mumbai" && <Dropdown.Item key={1}>Mumbai</Dropdown.Item>}
                  {character.currentChain !== "Fuji" && <Dropdown.Item key={2}>Fuji</Dropdown.Item>}
                </Dropdown.Menu>
              </Dropdown>
            </Card.Body>
          </Card>
  )
}
export default CharCardChain;