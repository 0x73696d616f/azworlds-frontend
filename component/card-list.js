import React from 'react';
import { Grid, Card, Text } from "@nextui-org/react";

const CharacterList = ({ characters }) => {
  if (!characters) return (<div>Loading...</div>);
  return (
    <Grid.Container gap={4}>
      {characters.map((character) => (
        <Grid xs={6} sm={3} key={character.charId}>
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
              <Text size="small">Buy Price: {character.buyPrice}</Text>
              <Text size="small">Equipped Items: {character.equippedItems.join(', ')}</Text>
              <Text size="small">Equipped Gold: {character.equippedGold}</Text>
              <Text size="small">Owner: {character.owner}</Text>
            </Card.Body>
          </Card>
        </Grid >
      ))}
    </Grid.Container>
  )
}
export default CharacterList;