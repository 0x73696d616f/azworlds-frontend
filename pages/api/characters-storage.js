import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const supabaseUrl = 'https://wylvkxjtrqxesqarblyf.supabase.co'
  const supabaseKey = process.env.SUPABASE_KEY
  const supabase = createClient(supabaseUrl, supabaseKey)
  let { data, error } = await supabase
  .from('Character')
  .select('*')
  return res.status(200).json(data);
}
