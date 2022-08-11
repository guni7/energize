import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { NftItem } from "../components/NftItem";
import { selectTezos, selectUserAddress } from "../features/tezos/selectors";
import { marketplaceContractAddress } from "../libs/constants";

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

const Profile = () => {
  const [userNfts, setUserNfts] = useState<any>([]);
  const [nftInfo, setNftInfo] = useState<any>([]);
  const params: any = useParams();
  const userAddress = params.user;
  useEffect(() => {
    async function getStorage() {
      try {
        const apiTokens = "https://api.ghost.tzstats.com/explorer/bigmap/161473/values" // TODO make dynamic
        const res = await fetch(apiTokens);
        const data = await res.json();
        console.log(userAddress)
        console.log(data.filter((nft: any) => nft.key[0] === userAddress));
        setUserNfts(data.filter((nft: any) => nft.key[0] === userAddress));
        const apiNftInfo = "https://api.ghost.tzstats.com/explorer/bigmap/161477/values" // TODO 
        const res2 = await fetch(apiNftInfo);
        const data2 = await res2.json();
        setNftInfo(data2);
        console.log(data2)
      } catch (e) {
      }
    }
    getStorage();
  }, [])
  return (
    <div>
      <Navbar />
      <div className="flex flex-row w-full bg-gray-800 h-" >
        <div className="flex flex-col items-center w-full">
          {
            userNfts.map((nft: any) => {
              if (nft && nftInfo.length !== 0) {
                return (
                  <NftItem
                    tokenId={nft.key[1]}
                    ownerAddress={nft.key[0]}
                    nftMetadata={nftInfo.find((info:any) => info.key[0] === nft.key[1])}
                    price={nft.value[0].price_per_token}
                  />
                )
              } else {
                return (
                  <div>
                    no nfts
                  </div>
                )
              }
            })
          }
        </div>
      </div>
    </div>
  )
}

export default Profile;

