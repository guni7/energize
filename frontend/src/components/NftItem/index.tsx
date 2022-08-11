import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectTezos } from "../../features/tezos/selectors";
import { marketplaceContractAddress } from "../../libs/constants"
import { TezosAccountAddress } from "../../types";
import { bytes2Char } from "@taquito/utils";
import { useHistory } from "react-router-dom";

type Props = {
  tokenId: string,
  ownerAddress?: string,
  nftMetadata?: any,
  price?: string
}

export const NftItem = ({ tokenId, ownerAddress, nftMetadata, price }: Props) => {

  const metadataIpfs = bytes2Char(nftMetadata?.value[1][""]);
  const [metadata, setMetadata] = useState<any>(undefined);
  const history = useHistory();

  useEffect(() => {
    console.log(price)
    console.log(Number(price) / 1000000)
    async function getMetadata() {
      try {
        console.log("asdasd ", metadataIpfs)
        console.log(metadataIpfs.slice(13))
        const response = await fetch(`https://cloudflare-ipfs.com/ipfs/${metadataIpfs.slice(13)}`)
        const metadata = await response.json();
        console.log(metadata)
        setMetadata(metadata);
      } catch (e) {
        console.log("err", e);
      }
    }
    getMetadata();
  }, [])

  return (
    nftMetadata &&
    <div className="w-1/3 m-2 mb-8" onClick={() => history.push(`/${ownerAddress}/tokens/${tokenId}`)}>
      <img src={`https://cloudflare-ipfs.com/ipfs/${metadata?.artifactUri.slice(7)}`} alt="nft"></img>
      <div className="flex flex-row text-indigo-50 justify-between">
        <div> {metadata?.name} </div>
        {price ? 
          <div> {Number(price) / 1000000} tez </div>
          :
          <div> </div>
        }
      </div>
    </div>
  )
}