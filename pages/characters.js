import Layout from "../component/layout";
import { useState, useEffect } from "react";
import CharacterList from "../component/card-list";

const Characters = () => {
  const [characters, setCharacters] = useState([]);
  useEffect(() => {
    fetch('/api/characters-storage')
      .then((res) => res.json())
      .then((characters) => {
        characters = characters.map(character => {
          character.url = character.url.slice(7, character.url.length- 14);
          character.img = `https://ipfs.io/ipfs/${character.img?.slice(7, character.img.length)}`;
          return {...character};
        });
        setCharacters(characters)
      })
    
  }, [])

  return (
    <>
      <Layout />
      <CharacterList characters={characters} />
    </>
  );
};


export default Characters;
