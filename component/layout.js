import { useState, useEffect } from "react";
import { Button, Dropdown, Input, Link } from "@nextui-org/react";
import NextLink from "next/link";

export const Layout = (props) => {
  const [haveMetamask, sethaveMetamask] = useState(true);
  const [charId, setChar] = useState({});
  const [domLoaded, setDomLoaded] = useState(false);

  const setCharHereAndParent = (charId) => {
    setChar(charId.target.value);
    props.setCharId(charId.target.value);
  };

  const [client, setclient] = useState({
    isConnected: false,
  });

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

  useEffect(() => {
    checkConnection();
    setDomLoaded(true);
  }, []);

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
              <Dropdown.Item key="upVsDownGame"><NextLink href="/upVsDownGame">UpVsDownGame</NextLink></Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>}
        </div>
        <div style={{ marginLeft: "1vw" }}>
            {domLoaded && <Input placeholder="Select Char Id" auto onChange={setCharHereAndParent} />}
          </div>
        <div className="d-flex" auto style={{ marginLeft: "auto" }}>
          <div>
            <Button color="warning" auto style={{marginRight:"1vw"}}> Documentation </Button>
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
          <div>
            <Link color="warning" href="https://twitter.com/3xJanx2009">
              <Button color="warning" auto style={{marginLeft:"1vw"}}>TW</Button>
            </Link>
          </div>
        </div>
      </nav>
      {/* Navbar end */}
    </>
  );
};

export default Layout;