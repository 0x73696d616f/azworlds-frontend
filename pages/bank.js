import Layout from "../component/layout";
import { Text, Button, Spacer, Table, Input, Tooltip } from "@nextui-org/react";
import styles from "../component/bank.module.css";
import { useState, useEffect } from "react";
import abi from "../contracts/Gold.json";
import USDCabi from "../contracts/USDC.json";
import { ethers } from "ethers";

const Bank = () => {
  const [charId, setCharId] = useState({});

  const [USDCDeposited, setUSDCDeposited] = useState(0);
  const [Gold, setGold] = useState(0);
  const [rewardsPreviewed, setRewardsPreviewed] = useState(0);
  const [USDCInvested, setUSDCInvested] = useState(0);
  const [amount, setAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [assets, setAssets] = useState(0);
  const [shares, setShares] = useState(0);

  const convertToAssets = async () => {
    setIsLoading(true);
      try {
        if (typeof window === undefined) return;
        const accounts = await ethereum.request({ method: "eth_accounts" });
        if (accounts.length <= 0) return;
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const goldAddress = "0x4Faf565e395a1C069a8132437D3b70BeF1A0d999";
        const bank = new ethers.Contract(goldAddress, abi, provider);
        const assets = await bank.convertToAssets(amount);
        setAssets(assets.toString());
    } catch(e) {
      console.log(e);
    }
    setIsLoading(false);
  }

  const convertToShares= async () => {
    setIsLoading(true);
    try {
      if (typeof window === undefined) return;
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length <= 0) return;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const goldAddress = "0x4Faf565e395a1C069a8132437D3b70BeF1A0d999";
      const bank = new ethers.Contract(goldAddress, abi, provider);
      const shares = await bank.convertToShares(amount);
      setShares(shares.toString());
    } catch(e) {
      console.log(e);
    }
    setIsLoading(false);
  }

  const updateVars = async () => {
    try {
      if (typeof window === undefined) return;
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length <= 0) return;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const goldAddress = "0x4Faf565e395a1C069a8132437D3b70BeF1A0d999";
      const bank = new ethers.Contract(goldAddress, abi, provider);
      const USDCDeposited = await bank.totalUsdc();
      const Gold = await bank.totalSupply();
      const rewardsPreviewed = await bank.previewRewards();
      const USDCInvested = await bank.getInvestment();
      setUSDCDeposited(Number(ethers.utils.formatEther(USDCDeposited)).toFixed(2));
      setGold(Number(ethers.utils.formatEther(Gold)).toFixed(2));
      setRewardsPreviewed(Number(ethers.utils.formatEther(rewardsPreviewed)).toFixed(2));
      setUSDCInvested(Number(ethers.utils.formatEther(USDCInvested)).toFixed(2));
    } catch(e) {
      console.log(e);
    }
  }

  const approve = async () => {
    setIsLoading(true);
      try {
        if (typeof window === undefined) return;
        const accounts = await ethereum.request({ method: "eth_accounts" });
        if (accounts.length <= 0) return;
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();
        const goldAddress = "0x4Faf565e395a1C069a8132437D3b70BeF1A0d999";
        const bank = new ethers.Contract(goldAddress, abi, signer);
        const usdc = await bank.asset();
        const usdcContract = new ethers.Contract(usdc, USDCabi, signer);
        const tx = await usdcContract.approve(goldAddress, ethers.constants.MaxUint256);
        await tx.wait();
    } catch(e) {
      console.log(e);
    }
    setIsLoading(false);
  }

  const deposit = async () => {
    setIsLoading(true);
      try {
        if (typeof window === undefined) return;
        const accounts = await ethereum.request({ method: "eth_accounts" });
        if (accounts.length <= 0) return;
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();
        const goldAddress = "0x4Faf565e395a1C069a8132437D3b70BeF1A0d999";
        const bank = new ethers.Contract(goldAddress, abi, signer);
        const tx = await bank.deposit(amount, signerAddress);
        await tx.wait();
        await updateVars();
    } catch(e) {
      console.log(e);
    }
    setIsLoading(false);
  }

  const withdraw = async () => {
    setIsLoading(true);
      try {
        if (typeof window === undefined) return;
        const accounts = await ethereum.request({ method: "eth_accounts" });
        if (accounts.length <= 0) return;
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();
        const goldAddress = "0x4Faf565e395a1C069a8132437D3b70BeF1A0d999";
        const bank = new ethers.Contract(goldAddress, abi, signer);
        const tx = await bank.withdraw(amount, signerAddress, signerAddress);
        await tx.wait();
        await updateVars();
    } catch(e) {
      console.log(e);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    setIsLoading(true);
    updateVars();
    setIsLoading(false);
  }, []);

  return (
    <>
    <div className={styles.bgWrap}>
      <Layout setCharId={setCharId} isLoading={isLoading}></Layout>
      <div style={{left:"1vw", top:"34vh", position:"absolute"}}>
      <Tooltip content={assets}>
      <Button auto color="warning" onPress={convertToAssets}>Convert To Assets</Button>
      </Tooltip>
      <Spacer y={0.5}></Spacer> 
      <Tooltip content={shares}>
      <Button auto color="warning" onPress={convertToShares}>Convert To Shares</Button>
      </Tooltip>
      <Spacer y={0.5}></Spacer>
      <Input placeholder="Amount" onChange={(e) => setAmount(e.target.value)}></Input>
      <Spacer y={0.5}></Spacer>
      <Button auto color="warning" onPress={approve}>Approve Deposit</Button>
      <Spacer y={0.5}></Spacer>
      <Button auto color="warning" onPress={deposit}>Deposit</Button>
      <Spacer y={0.5}></Spacer>
      <Button auto color="warning" onPress={withdraw}>Withdraw</Button>
      <Spacer y={0.5}></Spacer>
      </div>
      <div style={{right:"1vw", top:"31vh", position:"absolute"}}>
        <Table
        aria-label="Bank"
        css={{
            height: "auto",
            minWidth: "100%",
            color: "white"
        }}
        style={{color: 'white'}}
    >
        <Table.Header>
            <Table.Column>Info</Table.Column>
            <Table.Column>Amount</Table.Column>
        </Table.Header>
        <Table.Body style={{color: 'white'}}>
                <Table.Row key={0} style={{color: 'white'}}>
                    <Table.Cell style={{color: 'white'}}><Text color="white">Total USDC Deposited</Text></Table.Cell>
                    <Table.Cell style={{color: 'white'}}><Text color="white">{USDCDeposited}</Text></Table.Cell>
                </Table.Row>
                <Table.Row key={1}>
                    <Table.Cell style={{color: 'white'}}><Text color="white">Total Gold</Text></Table.Cell>
                    <Table.Cell style={{color: 'white'}}><Text color="white">{Gold}</Text></Table.Cell>
                </Table.Row>
                <Table.Row key={2}>
                    <Table.Cell style={{color: 'white'}}><Text color="white">Pending Rewards</Text></Table.Cell>
                    <Table.Cell style={{color: 'white'}}><Text color="white">{rewardsPreviewed}</Text></Table.Cell>
                </Table.Row>
                <Table.Row key={3}>
                    <Table.Cell style={{color: 'white'}}><Text color="white">USDC Invested</Text></Table.Cell>
                    <Table.Cell style={{color: 'white'}}><Text color="white">{USDCInvested}</Text></Table.Cell>
                </Table.Row>
        </Table.Body>
    </Table>
      </div>
      </div>
    </>
  );
};

export default Bank;
