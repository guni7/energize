import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { bytes2Char } from "@taquito/utils";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import { selectTezos } from "../features/tezos/selectors";
import { energizeContractAddress, marketplaceContractAddress } from "./../libs/constants";

type Props = {
  tokenId: string,
  userAddress: string
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
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [nftInfo, setNftInfo] = useState<any>([]);
  const [smartWallet, setSmartWallet] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const [metadataIpfs, setMetadataIpfs] = useState<string>()
  const Tezos = useSelector(selectTezos)

  const invTokens = {
    kUSD: {
      decimals: "18",
      address: "KT1Wgp6qSsDN7mCaDk5XDEQU52MezE8B9mr5"
    }
  }

  const energizeAmountChange = (e: any) => {
    setAmount(e.target.value);
  }

  const sellingPriceChange = (e: any) => {
    setSellingPrice(e.target.value);
  }
  const energize = async () => {
    // Approve Call 
    const tokenContract = await Tezos.wallet.at(invTokens.kUSD.address);
    const approveMethod1 = await tokenContract.methods.approve(energizeContractAddress, 0);

    const approveOp = await approveMethod1.send({
      storageLimit: 2000,
      gasLimit: 500000,
      fee: 200000
    });
    await approveOp.confirmation(1);

    const approveMethod2 = await tokenContract.methods.approve(energizeContractAddress, amount);

    const approveOp2 = await approveMethod2.send({
      storageLimit: 2000,
      gasLimit: 500000,
      fee: 200000
    });
    await approveOp2.confirmation(1);

    const contract = await Tezos.wallet.at(energizeContractAddress);
    const energizeMethod = contract.methodsObject.energizeWithInterest({
      amount: amount,
      nft_address: marketplaceContractAddress,
      nft_id: params.tokenId,
      token_id: 0 // TODO make dynamic
    });
    const op = await energizeMethod.send({
      storageLimit: 2000, // TODO 
      gasLimit: 500000,
      fee: 200000,
    });

    const confirmation = await op.confirmation(1);
    //TODO update storage
  }

  const setOnMarketplace = async () => {
    const marketplaceContract = await Tezos.wallet.at(marketplaceContractAddress);
    const updateOperatorsMethod = await marketplaceContract.methods.update_operators([
      {
        add_operator: {
          owner: params.user,
          operator: marketplaceContractAddress,
          token_id: params.tokenId
        }
      }
    ])
    const updateOp = await updateOperatorsMethod.send({
      storageLimit: 2000,
      gasLimit: 500000,
      fee: 200000
    });
    const confirmation = await updateOp.confirmation(1);

    const setOnMarketplaceMethod = marketplaceContract.methodsObject.set_on_market_place({
      price_per_token: sellingPrice,
      token_amount: "1",
      token_id: params.tokenId
    })
    const setOnMarketplaceOp = await setOnMarketplaceMethod.send({
      storageLimit: 2000,
      gasLimit: 500000,
      fee: 200000
    });
    const confirmation2 = await setOnMarketplaceOp.confirmation(1);
  }

  useEffect(() => {
    let smartWlt = "";
    async function getMetadata() {
      try {
        const apiNftInfo = "https://api.ghost.tzstats.com/explorer/bigmap/161477/values" // TODO 
        const res = await fetch(apiNftInfo);
        const data = await res.json();
        setNftInfo(data);
        console.log(data);
        const nftMetadata = data.find((info: any) => info.key === params.tokenId) // TODO make 1 dynamic usinng params
        if (nftMetadata) {
          setMetadataIpfs(bytes2Char(nftMetadata.value[1][""]));
        }
      } catch (e) {
        console.log("err", e);
      }
    }
    async function getWalletAddress() {

      try {
        const walletManagerStorageApi = "https://api.better-call.dev/v1/bigmap/ghostnet/158634/keys"
        const res = await fetch(walletManagerStorageApi);
        const data = await res.json();
        const smartWalletObj = data.find((dt: any) =>
          (dt.data.key.children[0].value === marketplaceContractAddress)
          && (dt.data.key.children[1].value === params.tokenId)
        )
        console.log(smartWalletObj)
        const smartWalletAddr = smartWalletObj.data.value.value
        console.log(smartWalletAddr)
        smartWlt = smartWalletAddr;
        setSmartWallet(smartWalletAddr)
      } catch (err) {
        console.log("err", err);
      }
    }
    async function getBalance() {
      try {
        const yTokenBalApi = "https://api.better-call.dev/v1/bigmap/ghostnet/122179/keys";
        const res = await fetch(yTokenBalApi);
        const data = await res.json();
        console.log(smartWlt, "smartWallet")
        const balObj = data.find((dt: any) => dt.data.key.children[0].value === smartWlt)
        console.log("balobj", balObj)
        const balance = balObj.data.value.value;
        console.log(balance)
        setBalance(balance);
      } catch (err) {
        console.log(err);
      }
    }
    getMetadata();
    getWalletAddress();
    getBalance();
  }, [])

  useEffect(() => {

    async function fetchMetadata() {
      console.log(metadataIpfs)
      try {
        const response = await fetch(`https://cloudflare-ipfs.com/ipfs/${metadataIpfs?.slice(13)}`)
        const metadata = await response.json();
        setMetadata(metadata);
      } catch (err) {
        console.log(err);
      }
    }
    fetchMetadata();
  }, [metadataIpfs])

  return (
    <div>
      <Navbar />
      <div className="flex bg-gray-800 h-screen items-center -mt-12 ">
        <div className="w-1/3 m-12 ml-48">
          <img
            src={`https://cloudflare-ipfs.com/ipfs/${metadata?.artifactUri.slice(7)}`} alt="nft"
          />
          <div className="text-pink-400 ">
          kUSD - {Number(balance)/1000000000000000000}
          </div>
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
            </div>
          </div>
          <div className="m-2 mt-12 border-t-2 border-pink-400 pt-4 border-double">
            <div className="text-gray-50 mt-2">
              <select className="bg-gray-700 text-pink-400 border-2 border-pink-400 rounded " >
                <option selected> kUSD </option>
              </select>
              <input
                type="text"
                name="title"
                className={textInputClass}
                placeholder="Enter Amount"
                onChange={(e: any) => energizeAmountChange(e)}
                value={amount}
              />
            </div>
            <div className="text-gray-50 mb-8">
              <button className={buttonClass} onClick={energize}> Energize </button>
            </div>


            <div className="flex border-t-2 border-pink-400 pt-4 border-double">
              <div className="text-gray-50 font-bold ">
                Selling Price
              </div>
              <input
                type="text"
                name="title"
                className={textInputClass}
                placeholder="Enter Amount"
                onChange={(e: any) => sellingPriceChange(e)}
                value={sellingPrice}
              ></input>
            </div>
            <div className="text-gray-50 mb-8">
              <button className={buttonClass} onClick={setOnMarketplace}> Set on Marketplace </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Nft;

let textInputClass =
  "bg-gray-800 border-b-2 border-pink-400 text-indigo-50 ml-4 w-36" +
  " focus:outline-none "

let buttonClass =
  " flex px-4 py-1 mt-8 blur-xl" +
  "  text-pink-400 " +
  " bg-gray-800  border-2 border-pink-400 border-dotted" +
  " hover:text-black hover:bg-pink-400 hover:border-transparent"