import Layout from "../component/layout";
import { useState, useEffect } from "react";
import CharacterList from "../component/card-list";
import styles from "../component/characters.module.css";

const Characters = () => {
  const [characters, setCharacters] = useState([]);
  const [charId, setCharId] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    setIsLoading(true);
    fetch('/api/characters-storage')
      .then((res) => res.json())
      .then((characters) => {
        characters = characters.map(character => {
          character.url = `https://ipfs.io/ipfs/${character.url?.slice(7, character.url.length)}`;
          character.img = `https://ipfs.io/ipfs/${character.img?.slice(7, character.img.length)}`;
          return {...character};
        });
        setCharacters(characters)
      }).then(() => setIsLoading(false));
    
    
  }, [])

  return (
    <>
      <div className={styles.bgWrap}>
      <Layout setCharId={setCharId} isLoading={isLoading}/>
      <CharacterList characters={characters} />
      </div>
    </>
  );
};


export default Characters;
