import React from 'react';
import { Card, Text, Link, Popover, Button } from "@nextui-org/react";

const CharCard = ({ character }) => {
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

            </Card.Body>
          </Card>
  )
}
export default CharCard;