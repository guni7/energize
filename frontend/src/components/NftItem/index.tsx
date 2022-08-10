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

  const metadataIpfs = bytes2Char(nftMetadata?.value[0][""]);
  const [metadata, setMetadata] = useState<any>(undefined);
  const history = useHistory();

  useEffect(() => {
    async function getMetadata() {
      try {
        const response = await fetch(`https://cloudflare-ipfs.com/ipfs/${metadataIpfs.slice(7)}`)
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
    <div className="w-1/3 m-2 mb-8" onClick={() => history.push(`/${ownerAddress}/tokens/${tokenId}`)}>
        <img src={`https://cloudflare-ipfs.com/ipfs/${metadata?.artifactUri.slice(7)}`} alt="nft"></img>
        <div className="flex flex-row text-indigo-50 justify-between">
          <div> {metadata?.name} </div>
          <div> {Number(price)/1000000} tez </div>
        </div>
    </div>
  )
}