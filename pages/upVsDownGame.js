import Layout from "../component/layout";
import { Text, Grid, Button, Row, Col, Spacer } from "@nextui-org/react";
import styles from "../component/upVsDownGame.module.css";
import { useState, useEffect, useRef } from "react";
import Chart from 'chart.js/auto';

const UpVsDownGame = () => {
  const [charId, setCharId] = useState({});
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [data, setData] = useState([]);

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
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <div className={styles.bgWrap} >
        <Layout setCharId={setCharId}></Layout>
        <div style={{ width: "55vw", marginLeft: "22.5vw" }}>
          <Grid.Container>
            <Col>
              <Row>
                <canvas ref={canvasRef} />
              </Row>
              <Row>
                <Button auto color="warning">Next round</Button>
                <Spacer auto x={0.5}></Spacer>
                <Button auto color="warning">Bet Up</Button>
                <Spacer auto x={0.5}></Spacer>
                <Button auto color="warning">Bet Down</Button>
                <Spacer auto x={0.5}></Spacer>
                <Button auto color="warning">Preview Rewards</Button>
                <Spacer auto x={0.5}></Spacer>
                <Button auto color="warning">Claim Rewards</Button>
              </Row>
            </Col>
          </Grid.Container>
        </div>
      </div>
    </>
  );
};

export default UpVsDownGame;
