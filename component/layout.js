import { useState, useEffect } from "react";
import { Button, Dropdown, Input, Link, Loading, Popover, Text } from "@nextui-org/react";
import NextLink from "next/link";
import UserCharacters from "./user-characters";
import CharCardChain from './charCardChain';
import ChainInventory from "./chain-inventory";

export const Layout = (props) => {
  const [haveMetamask, sethaveMetamask] = useState(true);
  const [characters, setCharacters] = useState([]);
  const [domLoaded, setDomLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [client, setclient] = useState({
    isConnected: false,
  });
  const [charId, setCharId] = useState("");
  const [addressInfo, setAddressInfo] = useState({chain: "", itemIds: {}, gold: ""});

  const setCharIdHereAndParent = (charId) => {
    setCharId(charId);
    try {
      props.setCharId(charId);
    } catch (error) {
      console.log("Error setting charId in parent", error);
    }
  }
    

  const checkConnection = async () => {
    const { ethereum } = window;
    if (ethereum) {
      sethaveMetamask(true);
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        setclient({
          isConnected: true,
          address: accounts[0],
        });
      } else {
        setclient({
          isConnected: false,
        });
      }
    } else {
      sethaveMetamask(false);
    }
  };

  const connectWeb3 = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Metamask not detected");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setclient({
        isConnected: true,
        address: accounts[0],
      });
    } catch (error) {
      console.log("Error connecting to metamask", error);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { ethereum } = window;
      if (!ethereum) return;
      sethaveMetamask(true);
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length < 0) return;
      let response = await fetch('/api/user-characters-storage', {
        method: 'POST',
        body: accounts[0],
      })
      let characters = await response.json();
      if (characters.length == 0) return;
      characters = characters.map(character => {
        character.url = `https://ipfs.io/ipfs/${character.url?.slice(7, character.url.length)}`;
        character.img = `https://ipfs.io/ipfs/${character.img?.slice(7, character.img.length)}`;
        return { ...character };
      });
      setCharacters(characters);
      response = await fetch('/api/address-info', {
        method: 'POST',
        body: accounts[0],
      })
      let addressInfo = await response.json();
      const chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log(chainId);
      if (chainId === "0xaa36a7") setAddressInfo(addressInfo[0]);
      else if (chainId === "0x13881") setAddressInfo(addressInfo[1]);
      else if (chainId === "0xa869") setAddressInfo(addressInfo[2]);
      else throw("Chain not supported");
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    setDomLoaded(true);
    loadData();
    checkConnection();
  }, [])

  return (
    <>
      {/* Navbar */}
      <nav className="fren-nav d-flex">
        <div>
          {domLoaded && < Dropdown>
            <Dropdown.Button color="warning" auto>Menu</Dropdown.Button>
            <Dropdown.Menu color="warning" aria-label="Static Actions">
              <Dropdown.Item key="home"><NextLink href="/">Home</NextLink></Dropdown.Item>
              <Dropdown.Item key="characters"><NextLink href="/characters">Characters</NextLink></Dropdown.Item>
              <Dropdown.Item key="auction"><NextLink href="/characterSale">Character Auction</NextLink></Dropdown.Item>
              <Dropdown.Item key="boss"><NextLink href="/boss">Fight Boss</NextLink></Dropdown.Item>
              <Dropdown.Item key="marketplace"><NextLink href="/marketplace">Marketplace</NextLink></Dropdown.Item>
              <Dropdown.Item key="military"><NextLink href="/military">Military</NextLink></Dropdown.Item>
              <Dropdown.Item key="bank"><NextLink href="/bank">Bank</NextLink></Dropdown.Item>
              <Dropdown.Item key="upVsDownGame"><NextLink href="/upVsDownGame">UpVsDownGame</NextLink></Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>}
        </div>
        <div style={{ marginLeft: "1vw" }}>
          <UserCharacters data={{ characters: characters, setCharId: setCharIdHereAndParent }}></UserCharacters>
        </div>
        <div style={{ marginLeft: "1vw"}}>
          <Popover>
            <Popover.Trigger>
              <Button auto color="warning" onPress={loadData}>Character Info</Button>
            </Popover.Trigger>
            <Popover.Content>
              <div style={{maxWidth:"20vw", maxHeight:"40vh"}}>
              <CharCardChain data={{setIsLoading: setIsLoading, character : characters[characters.findIndex((character) => character.charId === charId)]}}></CharCardChain>
              </div>
            </Popover.Content>
          </Popover>
        </div>
        {props.isLoading || isLoading && <Loading color="warning" style={{ position: "fixed", left: "50%" }}></Loading>}
        <div className="d-flex" auto style={{ marginLeft: "auto" }}>
        <div style={{ marginRight: "1vw"}}>
          <Popover>
            <Popover.Trigger>
              <Button auto color="warning" onPress={loadData}>Inventory</Button>
            </Popover.Trigger>
            <Popover.Content>
            <div style={{maxWidth:"40vw", maxHeight:"60vh"}}>
              <ChainInventory data={{setIsLoading: setIsLoading, addressInfo: addressInfo, charId: charId}}></ChainInventory>
              </div>
            </Popover.Content>
          </Popover>
        </div>
          <div>
            <Button color="warning" auto style={{ marginRight: "1vw" }}> Documentation </Button>
          </div>
          <div>
            <Button color="warning" auto onClick={connectWeb3}>
              {client.isConnected ? (
                <>
                  {client.address.slice(0, 4)}...
                  {client.address.slice(38, 42)}
                </>
              ) : (
                <>Connect Wallet</>
              )}
            </Button>
          </div>
        </div>
      </nav>
      {/* Navbar end */}
    </>
  );
};

export default Layout;