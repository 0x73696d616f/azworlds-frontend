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

  ({ data, error } = await supabase
  .from('UserInfoChain2')
  .select('*')
  .match({"address": utils.getAddress(req.body)}));
  if (data.length === 0)
    addressInfo.push({chain: "Mumbai", itemIds: {}, gold: 0});
  else
    addressInfo.push({chain: "Mumbai", itemIds: JSON.parse(data[0].itemIds), gold: data[0].gold});
    
  return res.status(200).json(addressInfo);
}
