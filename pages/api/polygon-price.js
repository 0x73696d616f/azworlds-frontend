import { ethers } from "ethers";
import oneInchAbi from "../../contracts/OneInch.json";

export default async function handler(req, res) {
  const alchemyKey = process.env.ALCHEMY_KEY_POLYGON;
  const provider = new ethers.providers.JsonRpcProvider(alchemyKey);
  const oneInchAddress = "0x7F069df72b7A39bCE9806e3AfaF579E54D8CF2b9";
  const oneInch = new ethers.Contract(oneInchAddress, oneInchAbi, provider);
  const BTCAddress = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063";
  const USDCAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
  const price = await oneInch.getRateToEth(BTCAddress, true);
  return res.status(200).json({price});
}
