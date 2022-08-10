import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { bytes2Char } from "@taquito/utils";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import { selectTezos } from "../features/tezos/selectors";
import { energizeContractAddress as contractAddress, marketplaceContractAddress } from "./../libs/constants";

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
  const [amount, setAmount] = useState<number>(0);
  const Tezos = useSelector(selectTezos)

  const nftMetadata = NftInfo.find(info => info.key[0] === nft.key[1]) // TODO make 1 dynamic usinng params
  let metadataIpfs: any;
  if (nftMetadata) {
    metadataIpfs = bytes2Char(nftMetadata.value[0][""]);
  }

  const amountChange = (e: any) => {
    setAmount(e.target.value);
  }

  const energize = async () => {
    const contract = await Tezos.wallet.at(contractAddress);
    const energizeMethod = contract.methodsObject.energizeWithInterest({
      amount: amount,
      nft_address: marketplaceContractAddress, // TODO 
      nft_id: params.tokenId,
      token_id: 0 // TODO make dynamic
    });
    //const op = await energizeMethod.send({
    //  storageLimit: 2000, // TODO 
    //  gasLimit: 500000,
    //  fee: 200000,
    //});

    console.log(energizeMethod);
    //const confirmation = await op.confirmation(3);
    //TODO update storage
  }

  useEffect(() => {
    async function getMetadata() {
      try {
        const response = await fetch(`https://cloudflare-ipfs.com/ipfs/${metadataIpfs.slice(7)}`)
        const metadata = await response.json();
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
      <div className="flex bg-gray-800 h-screen items-center -mt-24 ">
        <div className="w-1/3 m-12 ml-48">
          <img
            src={`https://cloudflare-ipfs.com/ipfs/${metadata?.artifactUri.slice(7)}`} alt="nft"
          />
        </div>
        <div className="m-12">
          <div className="m-2">
            <div className="text-gray-50 font-bold">
              Name
            </div>
            <div className="text-gray-50">
              {metadata?.name}
            </div>
          </div>
          <div className="m-2">
            <div className="text-gray-50 font-bold">
              Description
            </div>
            <div className="text-gray-50">
              {metadata?.description}
            </div>
          </div>
          <div className="m-2">
            <div className="text-gray-50 font-bold">
              Price
            </div>
            <div className="text-gray-50">
              {Number(nft.value[0].price_per_token) / 1000000} tez
            </div>
          </div>
          <div className="m-2 mt-12">
            <div className="text-gray-50 mt-2">
              <select className="bg-gray-700 text-pink-400 border-2 border-pink-400 rounded " >
                <option selected> kUSD </option>
              </select>
              <input
                type="text"
                name="title"
                className={textInputClass}
                placeholder="Enter Amount"
                onChange={(e: any) => amountChange(e)}
                value={amount}
              >
              </input>
            </div>
            <div className="text-gray-50">
              <button className={buttonClass} onClick={energize}> Energize </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Nft;

let textInputClass =
  "bg-gray-800 border-b-2 border-pink-400 text-indigo-50 ml-4" +
  " focus:outline-none "

let buttonClass =
  " flex px-4 py-1 mt-8 blur-xl" +
  "  text-pink-400 " +
  " bg-gray-800  border-2 border-pink-400 border-dotted" +
  " hover:text-black hover:bg-pink-400 hover:border-transparent"