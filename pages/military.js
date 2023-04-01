import Layout from "../component/layout";
import styles from "../component/military.module.css";
import { useState, useEffect } from "react";
import { Button, Grid, Text, Row, Col, Tooltip, Spacer } from "@nextui-org/react";
import abi from "../contracts/Military.json";
import { ethers } from "ethers";

const Military = () => {
  const [charId, setCharId] = useState({});
  const [isEnlisted, setIsEnlisted] = useState(false);
  const [rewards, setRewards] = useState(0);
  const [totalPower, setTotalPower] = useState(0);
  const [totalDeposited, setTotalDeposited] = useState(0);
  const [rewardsPerYearPerPower, setRewardsPerYearPerPower] = useState(0);
  const [firstExpire, setFirstExpire] = useState({});
  const militaryAddress = "0x84370e6Cd9247D8bCF7Ef81E0De3C6629b887E79";

  const updateCharId = async (e) => {
    setCharId(""+e);
    updateVars();
  };

  function toDateTime(secs) {
    var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
    d.setUTCSeconds(secs);
    return d;
}

  const joinArmy = async () => {
    if (typeof window.ethereum === "undefined") return;
    if (typeof charId !== "string") return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const military = new ethers.Contract(militaryAddress, abi, signer);
    if (isEnlisted) return;
    const tx = await military.join(charId);
    await tx.wait();
  }
  
  const leaveArmy = async () => {
    if (typeof window.ethereum === "undefined") return;
    if (typeof charId !== "string") return;
    updateVars();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const military = new ethers.Contract(militaryAddress, abi, signer);
    if (!isEnlisted) return;
    const tx = await military["leave(uint256)"](charId);
    await tx.wait();
  }

  const claimRewards = async () => {
    if (typeof window.ethereum === "undefined") return;
    if (typeof charId !== "string") return;
    updateVars();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const military = new ethers.Contract(militaryAddress, abi, signer);
    if (rewards === 0) return;
    const tx = await military.getRewards(charId);
    await tx.wait();
  }

  const previewRewards = async () => {
    updateVars();
  }

  const updateVars = async () => {
    if (typeof window === undefined) return;
    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length <= 0) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const military = new ethers.Contract(militaryAddress, abi, signer);
    const currTotalPower = await military._totalPower();
    setTotalPower(currTotalPower.toString());
    const currTotalDeposited = await military._totalDeposited();
    setTotalDeposited(ethers.utils.formatEther(currTotalDeposited));
    const currRewarsPerYearPerPower = currTotalDeposited/(365*24*3600)/currTotalPower;
    setRewardsPerYearPerPower(currRewarsPerYearPerPower.toString());
    const firstExpiringDeposit = await military._firstExpiringDeposit();
    let currFirstExpire = await military._deposits(firstExpiringDeposit);
    setFirstExpire({amount:  (currFirstExpire.amount*1/(10**18)).toFixed(2), expire: toDateTime(currFirstExpire.expireTimestamp).toDateString()});
    if (typeof charId !== "string") return;
    const isEnlisted = await military.isCharEnlisted(charId);
    setIsEnlisted(isEnlisted);
    const currRewards = await military.previewRewards(charId);
    setRewards(currRewards.toString());
  }

  useEffect(() => {
    updateVars();
  });

  return (
    <>
    <div className={styles.bgWrap}>
      <Layout setCharId={updateCharId}></Layout>
      <Grid.Container gap={2} direction="column">
        <Col >
        <Row gap={7}>
        {isEnlisted && <Text className="text" style={{justifyContent: "center"}}>Currently Enlisted</Text>}
        {!isEnlisted && <Text className="text" style={{justifyContent: "center"}}>Not Enlisted</Text>}
        </Row>
        <Spacer y={1} />
        <Row gap={7}>
        <Button color="warning" auto onClick={joinArmy}>Join The Army</Button>
        </Row>
        <Spacer y={1} />
        <Row gap={7}>
        <Button color="warning" auto onClick={leaveArmy}>Leave The Army</Button>
        </Row>
        <Spacer y={1} />
        <Row gap={7}>
        <Button color="warning" auto onClick={claimRewards}>Claim Rewards</Button>
        </Row>
        <Spacer y={1} />
        <Row gap={7}>
        <Tooltip content={rewards}>
        <Button color="warning" auto onClick={previewRewards}>Preview Char Gold Rewards</Button>
        </Tooltip>
        </Row>
        <Spacer y={1} />
        <Row gap={7}>
        <Tooltip content={totalPower}>
        <Button color="warning" auto onClick={updateVars}>Get Total Army Power</Button>
        </Tooltip>
        </Row>
        <Spacer y={1} />
        <Row gap={7}>
        <Tooltip content={totalDeposited}>
        <Button color="warning" auto onClick={updateVars}>Get Total USDC Deposited</Button>
        </Tooltip>
        </Row>
        <Spacer y={1} />
        <Row gap={7}>
        <Tooltip content={rewardsPerYearPerPower}>
        <Button color="warning" auto onClick={updateVars}>Get Gold Per Second Per Power</Button>
        </Tooltip>
        </Row>
        <Spacer y={1} />
        <Row gap={7}>
        <Tooltip content={firstExpire.amount + " USDC Deposit Expires at " + firstExpire.expire}>
        <Button color="warning" auto onClick={updateVars}>Get Next Expiring Deposit</Button>
        </Tooltip>
        </Row>
        </Col>
      </Grid.Container>
      </div>
    </>
  );
};

export default Military;
