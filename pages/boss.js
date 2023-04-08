import Layout from "../component/layout";
import styles from "../component/boss.module.css"
import { Button, Grid, Progress, Text, Tooltip, Input, Table } from "@nextui-org/react";
import abi from "../contracts/Boss.json";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

const Boss = () => {
  const [domLoaded, setDomLoaded] = useState(false);
  const [lastRound, setLastRound] = useState(0);
  const [roundDuration, setRoundDuration] = useState(0);
  const [roundId, setRoundId] = useState(0);
  const [time, setTime] = useState(0);
  const [attacked, setAttacked] = useState(false);
  const [charId, setCharId] = useState({});
  const [selectedRoundId, setSelectedRoundId] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [roundData , setRoundData] = useState([]);

  const setCharIdUpdate = async (charId) => {
    setCharId(charId);
    setIsLoading(true);
    try {
      await updateVars(charId);
    } catch(e) {
      console.log(e);
    }
    setIsLoading(false);
  }

  const display = function(seconds) {
    return new Date(seconds * 1000).toISOString().slice(11, 19);
  }

  const updateVars = async (charId) => {
    let boss;
    try {
      if (typeof window === undefined) return;
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length <= 0) return;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const bossAddress = process.env.NEXT_PUBLIC_BOSS;
      boss = new ethers.Contract(bossAddress, abi, signer);
      const lastRoundTimestamp = await boss.lastRoundTimestamp();
      const currentRoundId = await boss.roundId();
      const roundDuration = await boss.ROUND_DURATION();

      setRoundDuration(roundDuration.toNumber());
      setLastRound(lastRoundTimestamp.toNumber());
      setRoundId(currentRoundId.toNumber());

      if (!charId || typeof charId !== "string") {
        setAttacked(false);
        return boss;
      }

      let roundData = [];
      for(let i = 0; i < currentRoundId; i++) {
        const roundInfo = await boss.charInfo(i, charId);
        roundData.push(roundInfo);
      }
      setRoundData(roundData);

      const currCharInfo = await boss.charInfo(currentRoundId.toNumber(), charId);
      setAttacked(currCharInfo.attacked);
    } catch (err) {
      console.log(err);
    }
    return boss;
  }

  const changeSelectedRoundId = async (e) => {
    setSelectedRoundId(e.target.value);
    setIsLoading(true);
    await updateVars(charId);
    setIsLoading(false);
  }

  const attackBoss = async () => {
    try {
      if (typeof window === "undefined") return;
      if (!charId || typeof charId !== "string") return;
      const boss = await updateVars(charId);
      if (attacked) return;
      const tx = await boss.attackBoss(charId);
      setIsLoading(true);
      await tx.wait();
      await updateVars(charId);
    } catch (e) {
      console.log(e);
    }
    setIsLoading(false);
  };

  const claimRewards = async () => {
    try {
      if (typeof window === "undefined") return;
      const boss = await updateVars(charId);
      const tx = await boss.claimRewards(charId, selectedRoundId);
      setIsLoading(true);
      await tx.wait();
      await updateVars(charId);
    } catch (e) {
      console.log(e);
    }
    console.log(isLoading);
    setIsLoading(false);
    console.log(isLoading);
  };

  const nextRound = async () => {
    try {
      if (typeof window === "undefined") return;
      const boss = await updateVars(charId);
      if (roundDuration + lastRound - time > 0) return;
      const tx = await boss.nextRound({gasLimit: 1000000});
      setIsLoading(true);
      await tx.wait();
      await updateVars(charId);
    } catch (e) {
      console.log(e);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    async function fetchData() {
      await updateVars(charId);
    }
    fetchData();
    setDomLoaded(true);
    const intervalId = setInterval(() => {
      setTime(Math.floor(new Date().getTime()/1000));
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
    <div className={styles.bgWrap}>
      <Layout setCharId={setCharIdUpdate} isLoading={isLoading}/>
      <Grid.Container direction="row" gap={2} justify="center" align="center" style={{position: 'absolute', top:"15vh"}}>
        <Grid>
          {attacked && <Tooltip content={"Already attacked"}>
            <Button color="warning" onPress={attackBoss}>Attack Boss</Button>
          </Tooltip>}

          {!attacked && typeof charId !== 'string' && <Tooltip content={"Select a char"}>
            <Button color="warning" onPress={attackBoss}>Attack Boss</Button>
          </Tooltip>}

        
          {!attacked && typeof charId === 'string' && <Button color="warning" onPress={attackBoss}>Attack Boss</Button>}
        </Grid>
        <Grid>
          {<Button color="warning" onPress={claimRewards}>Claim Rewards</Button>}
          {domLoaded && <Input type="text" onBlur={changeSelectedRoundId} placeholder="Select Round Id To Claim"/>}
        </Grid>
      </Grid.Container>
      <Table color="warning" style={{width:"30vw", position: 'absolute', bottom: "5vh", right: "2vw"}}>
        <Table.Header>
          <Table.Column>Round Id</Table.Column>
          <Table.Column>Attacked</Table.Column>
          <Table.Column>Claimed</Table.Column>
        </Table.Header>
        <Table.Body>
          {roundData.map((round, index) => (
            <Table.Row key={index}>
              <Table.Cell>{index}</Table.Cell>
              <Table.Cell>{round.attacked ? "Yes" : "No"}</Table.Cell>
              <Table.Cell>{round.claimed ? "Yes" : "No"}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
        <Table.Pagination
          shadow
          noMargin
          align="center"
          rowsPerPage={6}
          onPageChange={(page) => console.log({ page })}
      />
      </Table>
      <Grid.Container xs={6} sm={3} gap={2} justify="center" align="center" style={{ position: 'absolute', bottom: "5vh", left: '50%', transform: 'translateX(-50%)' }}>
      {(roundDuration + lastRound - time < 0) && <Tooltip content={`Current Round Id ${roundId}`}><Button color="warning" onPress={nextRound}>Go to next round</Button></Tooltip>}
      { domLoaded && (roundDuration + lastRound - time > 0) &&<Text color="#ffffff" className={styles.text}>Next round in {display(Math.floor(roundDuration + lastRound - time))}</Text>}
      { domLoaded && (roundDuration + lastRound - time > 0) &&<Progress color="warning" value={100 - 100*(roundDuration + lastRound - time)/roundDuration}/>}
      </Grid.Container>
    </div>
    </>
  );
};


export default Boss;
