import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { bytes2Char } from "@taquito/utils";
import Navbar from "../components/Navbar";

type Props = {
  tokenId: string,
  userAddress: string
}

let nft = {
  "key": {
    "0": "tz1XsBudQn7Xvn1msvmgDDNqBKeqRh5atuVW",
    "1": "1"
  },
  "hash": "exprupfsSCLsCAz2eSPx7SnCGY27yxX5JyMDj3cwzqGEj3XXR4dMA8",
  "value":
    [
      {
        "price_per_token": "100000",
        "timestamp": "2022-08-05T18:57:55Z",
        "token_amount": "1"
      }
    ]
}
let NftInfo = [
  {
    "key": {
      "0": "1",
    },
    "hash": "exprupfsSCLsCAz2eSPx7SnCGY27yxX5JyMDj3cwzqGEj3XXR4dMA8",
    "value":
      [
        {
          "token_id": "1",
          "": "697066733a2f2f516d555a69544c55384e527352776546357350684d3538586b323161334b634c6a774d5937534654676563684779"
        }
      ]
  }
]

const Nft = () => {
  const params: any = useParams();
  const [metadata, setMetadata] = useState<any>(undefined);


  const nftMetadata = NftInfo.find(info => info.key[0] === nft.key[1]) // TODO make 1 dynamic usinng params
  let metadataIpfs: any;
  if (nftMetadata) {
    metadataIpfs = bytes2Char(nftMetadata.value[0][""]);
  }

  useEffect(() => {
    async function getMetadata() {
      try {
        const response = await fetch(`https://cloudflare-ipfs.com/ipfs/${metadataIpfs.slice(7)}`)
        const metadata = await response.json();
        console.log("meraEQ",metadata)
        setMetadata(metadata);
      } catch (e) {
        console.log("err", e);
      }
    }
    getMetadata();
  }, [])

  return (
    <div>
      <Navbar />
      <div className="flex bg-gray-800 h-screen">
        <div className="w-1/3">
          <img
            src={`https://cloudflare-ipfs.com/ipfs/${metadata?.artifactUri.slice(7)}`} alt="nft"
          />
        </div>
        <div className="m-2">
          <div className="m-2">
            <div className="text-gray-50">
              Name
            </div>
            <div className="text-gray-50">
              {metadata?.name}
            </div>
          </div>
          <div className="m-2">
            <div className="text-gray-50">
              Description
            </div>
            <div className="text-gray-50">
              {metadata?.description}
            </div>
          </div>
          <div className="m-2">
            <div className="text-gray-50">
              Price 
            </div>
            <div className="text-gray-50">
              {nft.value[0].price_per_token}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Nft;