import React from 'react';
import { Grid, Card, Text, Link, Popover, Button } from "@nextui-org/react";
import CharCard from './charCard';

const CharacterList = ({ characters }) => {
  if (!characters) return (<div>Loading...</div>);
  return (
    <Grid.Container gap={4}>
      {characters.map((character) => (
        <Grid xs={6} sm={3} key={character.charId}>
        <CharCard character={character}></CharCard>
        </Grid>
      ))}
    </Grid.Container>
  )
}
export default CharacterList;