import { File, NFTStorage } from "nft.storage";
import formidable from 'formidable';
import fs from "fs";

// Disable NextJS body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const nftstorage_key = process.env.NFT_STORAGE_API_KEY;
  const form = new formidable.IncomingForm();
  form.uploadDir = "./";
  form.keepExtensions = true;
  form.parse(req, async(err, fields, files) => {
    if (err)
      return res.send({status: "500", error: err});
    const buffer = fs.readFileSync(files.image.filepath);
    const file = new File([buffer], files.image.originalFilename, { type: files.image.mimetype });
    console.log("Preparing Metadata ....");
    const nft = {
      image: file,
      name: fields.name,
      description: fields.description,
    };
    console.log("Uploading Metadata to IPFS ....");
    const client = new NFTStorage({ token: nftstorage_key });
    const metadata = await client.store(nft);
    console.log(metadata);
    console.log("NFT data stored successfully 🚀🚀");
    console.log("Metadata URI: ", metadata.url);
    return res.send({status: "200", url: metadata.url});
  });
}
