import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import Navbar from "../components/Navbar";
import { NftItem } from "../components/NftItem";


let marketplaceNfts = [
  {
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
  },
  {
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
]
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

const Marketplace = () => {

  const history = useHistory();
  useEffect(() => {
    async function getStorage() {
      try {

        // fetch big map 
      } catch (e) {
        console.log("error", e);
      }
    }
    getStorage();
  }, [])
  return (
    <div>
      <Navbar />
      <div className="flex flex-row w-full bg-gray-800 " >
        <div className="flex flex-col items-center w-full">
          {
            marketplaceNfts.map((nft) => {
              return (
                <NftItem
                  tokenId={nft.key[1]}
                  ownerAddress={nft.key[0]}
                  nftMetadata={NftInfo.find(info => info.key[0] === nft.key[1])}
                  price={nft.value[0].price_per_token}
                  //onClick={()=> history.push('')}
                />
              )
            })
          }
        </div>
      </div>
    </div>
  )
}

export default Marketplace;

