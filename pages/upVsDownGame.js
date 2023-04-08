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
      const upVsDownGameAddress = "0x884Fc9CFab2A0BBE0aD647B75249609B72Ad20B9";
      const upVsDownGame = new ethers.Contract(upVsDownGameAddress, abi, signer);
      const roundDuration = await upVsDownGame.GAME_DURATION();
      setRoundDuration(roundDuration.toNumber());
      const tx = await upVsDownGame.trigger(0, 100, price);
      setInitialPrice(price);
      await tx.wait();
      setInitialRoundTime(new Date().getTime() / 1000);
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
      const upVsDownGameAddress = "0x884Fc9CFab2A0BBE0aD647B75249609B72Ad20B9";
      const upVsDownGame = new ethers.Contract(upVsDownGameAddress, abi, signer);
      const tx = await upVsDownGame.trigger(0, 1000, price);
      await tx.wait();
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
      const upVsDownGameAddress = "0x884Fc9CFab2A0BBE0aD647B75249609B72Ad20B9";
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
      const upVsDownGameAddress = "0x884Fc9CFab2A0BBE0aD647B75249609B72Ad20B9";
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
    const id = setInterval(async () => {
      await updatePrice();
      setTime(Math.floor(initialRoundTime + roundDuration - new Date().getTime() / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <div className={styles.bgWrap} >
        <Layout props={{setCharId: setCharId, isLoading: isLoading}}></Layout>
        <div style={{ width: "55vw", marginLeft: "22.5vw" }}>
          <Grid.Container>
            <Col>
            <Row style={{ marginLeft: "0vw" }}>
              <Text size={20}>Next Round: {(time + roundDuration) > 0 ? time + roundDuration : 0}</Text>
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
