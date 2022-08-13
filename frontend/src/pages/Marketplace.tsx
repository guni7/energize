import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Navbar from "../components/Navbar";
import { NftItem } from "../components/NftItem";


let nftInfo = [
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

let x = [
  {
    "key": "1",
    "hash": "expru2dKqDfZG8hu4wNGkiyunvq2hdSKuVYtcKta7BWP6Q18oNxKjS",
    "value": {
      "0": "1",
      "1": {
        "": "050100000035697066733a2f2f516d555a69544c55384e527352776546357350684d3538586b323161334b634c6a774d5937534654676563684779"
      }
    }
  }
]

const Marketplace = () => {

  const history = useHistory();
  const [marketplaceNfts, setMarketplaceNfts] = useState<any>([])
  const [nftInfo, setNftInfo] = useState<any>([]);
  useEffect(() => {
    async function getStorage() {
      try {
        const apiMkt = "https://api.ghost.tzstats.com/explorer/bigmap/161474/values" // TODO make dynamic
        const res = await fetch(apiMkt);
        const data = await res.json();
        const apiNftInfo = "https://api.ghost.tzstats.com/explorer/bigmap/161477/values" // TODO 
        const res2 = await fetch(apiNftInfo);
        const data2 = await res2.json();
        data.map((nft: any) => {
          const x = data2.find((info: any) => {
            return (info.key[0] === nft.key[0])
          })
          console.log(x);
        })
        setNftInfo(data2);
        setMarketplaceNfts(data);
      } catch (e) {
        console.log("error", e);
      }
    }
    getStorage();
  }, [])
  return (
    <div>
      <Navbar />
      <div className="flex flex-row w-full bg-gray-800 h-full" >
        <div className="flex flex-col items-center w-full">
          {
            marketplaceNfts.map((nft: any) => {
              if (nft && nftInfo.length !== 0) {
                return (
                  <NftItem
                    tokenId={nft.key[0]}
                    ownerAddress={nft.key[1]}
                    nftMetadata={nftInfo.find((info: any) => info.key[0] === nft.key[0])}
                    price={nft.value[0]}
                  />
                )
              } else {
                return (
                  <>no nfts</>
                )
              }
            })
          }
        </div>
      </div>
    </div>
  )
}

export default Marketplace;

