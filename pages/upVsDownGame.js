import Layout from "../component/layout";
import { Text, Grid, Button, Row, Col, Spacer, Input } from "@nextui-org/react";
import styles from "../component/upVsDownGame.module.css";
import { useState, useEffect, useRef } from "react";
import Chart from 'chart.js/auto';
import abi from "../contracts/UpVsDownGame.json";
import { ethers } from "ethers";

const UpVsDownGame = () => {
  const [charId, setCharId] = useState({});
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [data, setData] = useState([]);
  const [initialPrice, setInitialPrice] = useState(0);
  const [price, setPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [initialRoundTime, setInitialRoundTime] = useState(0);
  const [time, setTime] = useState(0);
  const [roundDuration, setRoundDuration] = useState(0);
  const [bet, setBet] = useState(0);

  const nextRound = async () => {
    setIsLoading(true);
    try {
      if (typeof window === undefined) return;
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length <= 0) return;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const upVsDownGameAddress = process.env.NEXT_PUBLIC_GAME;
      const upVsDownGame = new ethers.Contract(upVsDownGameAddress, abi, signer);
      const roundDuration = await upVsDownGame.GAME_DURATION();
      setRoundDuration(Number(roundDuration));
      const tx = await upVsDownGame.trigger("0x00", 1000, ethers.utils.parseUnits(price.toString(), "ether"));
      setInitialPrice(price.toFixed(7));
      await tx.wait();
      const currentTime = new Date().getTime() / 1000;
      setInitialRoundTime(Math.floor(currentTime));
    } catch(e) {
      console.log(e);
    }
    setIsLoading(false);
  }

  const finishRound = async () => {
    setIsLoading(true);
    try {
      if (typeof window === undefined) return;
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length <= 0) return;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const upVsDownGameAddress = process.env.NEXT_PUBLIC_GAME;
      const upVsDownGame = new ethers.Contract(upVsDownGameAddress, abi, signer);
      const tx = await upVsDownGame.trigger("0x00", 1000, ethers.utils.parseUnits(price.toString(), "ether"));
      await tx.wait();
      setInitialPrice(0);
    } catch(e) {
      console.log(e);
    }
    setIsLoading(false);
  }

  const upBet = async () => {
    setIsLoading(true);
    try {
      if (typeof window === undefined) return;
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length <= 0) return;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const upVsDownGameAddress = process.env.NEXT_PUBLIC_GAME;
      const upVsDownGame = new ethers.Contract(upVsDownGameAddress, abi, signer);
      const tx = await upVsDownGame.makeTrade({poolId: "0x00", avatarUrl: "url", countryCode: "PT", upOrDown: true, goldBet: bet});
      await tx.wait();
    } catch(e) {
      console.log(e);
    }
    setIsLoading(false);
  }

  const downBet = async () => {
    setIsLoading(true);
    try {
      if (typeof window === undefined) return;
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length <= 0) return;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const upVsDownGameAddress = process.env.NEXT_PUBLIC_GAME;
      const upVsDownGame = new ethers.Contract(upVsDownGameAddress, abi, signer);
      const tx = await upVsDownGame.makeTrade({poolId: "0x00", avatarUrl: "url", countryCode: "PT", upOrDown: false, goldBet: bet});
      await tx.wait();
    } catch(e) {
      console.log(e);
    }
    setIsLoading(false);
  }

  const updatePrice = async () => {
    chartRef.current.data.datasets = [{ data: data, borderColor: 'white' }];
    chartRef.current.update();
    const response = await fetch("/api/polygon-price");
    const price = await response.json();
    const timeDiff = data.length !== 0 ? data[data.length - 1].x + 1 : 0;
    data.push({ x: timeDiff, y: parseFloat(price.price.hex * 1.0 / 10e17) });
    if (data.length >= 60) {
      data.shift();
      data.map((d) => {
        d.x -= 1;
      });
    }
    setData(data);
    setPrice(parseFloat(price.price.hex * 1.0 / 10e17));
  }

  useEffect(() => {
    if (canvasRef.current && data) {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
      const ctx = canvasRef.current.getContext('2d');
      chartRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [{
            data: data,
            borderColor: 'white',
          }]
        },
        options: {
          animation: {
            duration: 0
          },
          elements: {
            point: {
              radius: 0
            }
          },
          plugins: {
            legend: {
                display: false,
             } }, 
          scales: {
            x: {
              type: 'linear',
              position: 'bottom',
              grid: {
                color: 'black'
              },
              ticks: {
                color: "black",
                font: {
                  size: 0,
                },
              }
            },
            y: {
              type: 'linear',
              position: 'left',
              grid: {
                color: 'black'
              },
              ticks: {
                color: "black",
                font: {
                  size: 20,
                },
              }
            }
          }
        }
      });
    }
  }, []);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        await updatePrice();
        setTime(initialRoundTime + roundDuration - Math.floor(new Date().getTime() / 1000));
      }
      catch {
        console.log("error");
      }
    }, 1000);
    return () => clearInterval(id);
  }, [initialRoundTime, roundDuration])

  return (
    <>
      <div className={styles.bgWrap} >
        <Layout setCharId={setCharId} isLoading={isLoading}></Layout>
        <div style={{ width: "55vw", marginLeft: "22.5vw" }}>
          <Grid.Container>
            <Col>
            <Row style={{ marginLeft: "0vw" }}>
              <Text size={20}>Next Round: {time + roundDuration > 0 ? time + roundDuration: 0}</Text>
              <Spacer x={7}></Spacer>
              <Text size={20}>Initial Value: {initialPrice}</Text>
              <Spacer x={4}></Spacer>
              <Text size={20}>Time Left: {(time) > 0 ? time : 0} </Text>
            </Row>
              <Row>
                <canvas ref={canvasRef} />
              </Row>
              <Row>
                <Button auto color="warning" onPress={nextRound}>Next round</Button>
                <Spacer auto x={0.5}></Spacer>
                <Button auto color="warning" onPress={upBet}>Bet Up</Button>
                <Spacer auto x={0.5}></Spacer>
                <Input placeholder="Bet" auto onChange={(e) => setBet(e.target.value)}></Input>
                <Spacer auto x={0.5}></Spacer>
                <Button auto color="warning" onPress={downBet}>Bet Down</Button>
                <Spacer auto x={0.5}></Spacer>
                <Button auto color="warning" onPress={finishRound}>Finish Round</Button>
              </Row>
            </Col>
          </Grid.Container>
        </div>
      </div>
    </>
  );
};

export default UpVsDownGame;
