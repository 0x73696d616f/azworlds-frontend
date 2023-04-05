import { createClient } from '@supabase/supabase-js';
const { utils } = require('ethers');

export default async function handler(req, res) {
  const supabaseUrl = 'https://wylvkxjtrqxesqarblyf.supabase.co'
  const supabaseKey = process.env.SUPABASE_KEY
  const supabase = createClient(supabaseUrl, supabaseKey)
  let { data, error } = await supabase
  .from('UserInfoChain1')
  .select('*')
  .match({"address": utils.getAddress(req.body)})
  let addressInfo = [];
  addressInfo.push({chain: "Sepolia", itemIds: JSON.parse(data[0].itemIds), gold: data[0].gold});
  return res.status(200).json(addressInfo);
}
