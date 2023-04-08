import { useState, useEffect } from "react";
import { Dropdown } from "@nextui-org/react";

const UserCharacters = (data) => {
    const [charId, setCharId] = useState("");

    const setCharHereAndParent = (charId) => {
        setCharId(charId);
        data.setCharId(charId);
   };

   const loadChars = async () => {
    const { ethereum } = window;
    if (!ethereum) return;
    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length < 0) return;
    const response = await fetch('/api/user-characters-storage',{
      method:'POST',
      body: accounts[0],
      })
    let characters = await response.json();
    if (characters.length === 0) return;
    setCharId(characters[0].charId);
    data.setCharId(characters[0].charId);
  }

    useEffect(() => {
        loadChars();
    }, [])

  if (data && data.characters.length === 0) return (<Dropdown><Dropdown.Button aria-label="NoCharactersButton" disabled color="warning" auto>No Characters</Dropdown.Button></Dropdown>);

  return (
    <Dropdown>
    <Dropdown.Button color="warning" auto aria-label="CharactersButton">Char {charId}</Dropdown.Button>
    <Dropdown.Menu color="warning" aria-label="Characters" auto onAction={setCharHereAndParent}>
      {data.characters.map((character) => {
          return(
                <Dropdown.Item key={character.charId} auto aria-label={character.charId}>
                    Char: {character.charId} Chain: {character.currentChain}
                </Dropdown.Item>            
            )})}
    </Dropdown.Menu>
  </Dropdown>
  )
}
export default UserCharacters;