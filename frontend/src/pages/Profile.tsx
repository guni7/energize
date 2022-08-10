import { useEffect } from "react";
import { useSelector } from "react-redux";
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

const Profile = () => {

  const userAddress = useSelector(selectUserAddress);
  const Tezos = useSelector(selectTezos);
  const userNfts = marketplaceNfts.filter(nft => nft.key[0] === userAddress)
  useEffect(() => {
    async function getStorage() {
      try {
      } catch (e) {
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
            userNfts.map((nft) => {
              return (
                <NftItem
                  tokenId={nft.key[1]}
                  ownerAddress={nft.key[0]}
                  nftMetadata={NftInfo.find(info => info.key[0] === nft.key[1])}
                  price={nft.value[0].price_per_token}
                />
              )
            })
          }
        </div>
      </div>
    </div>
  )
}

export default Profile;

