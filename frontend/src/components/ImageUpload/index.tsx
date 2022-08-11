import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { selectMinting, selectPinning } from "../../features/marketplace/selectors";
import { setMinting, setPinning } from "../../features/marketplace/slice";
import { selectDescription, selectFile, selectTitle } from "../../features/mintForm/selectors";
import { setFile } from "../../features/mintForm/slice";
import { selectTezos, selectUserAddress } from "../../features/tezos/selectors";
import { marketplaceContractAddress } from "../../libs/constants";

export const ImageUpload = () => {
  const [image, setImage] = useState<any>(undefined);
  const dispatch = useDispatch();
  const file = useSelector(selectFile);
  const title = useSelector(selectTitle);
  const description = useSelector(selectDescription);
  const userAddress = useSelector(selectUserAddress);
  const pinning = useSelector(selectPinning);
  const minting = useSelector(selectMinting);
  const Tezos = useSelector(selectTezos);
  const history = useHistory();

  let upload = async () => {
    try {
      dispatch(setPinning(true));
      const data = new FormData();
      data.append("image", file);
      data.append("title", title);
      data.append("description", description);
      if (userAddress) {
        data.append("creator", userAddress);
      }
      console.log(userAddress);
      console.log(file);
      const response = await fetch(`http://localhost:8080/mint`, {
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        body: data
      });

      if (response) {
        dispatch(setPinning(false));
        const data = await response.json();
        if (
          data.status === true &&
          data.msg.metadataHash &&
          data.msg.imageHash
        ) {
          dispatch(setPinning(false));
          dispatch(setMinting(true));
          // mint here
          const mktContract = await Tezos.wallet.at(marketplaceContractAddress);
          try {
            const op = await mktContract.methods
              .mint('1', data.msg.metadataHash)
              .send();
            await op.confirmation();
            history.push(`${userAddress}/tokens`)
          } catch (e) {
            console.log(e)
          }
          console.log(data);
        } else {
          throw "No IPFS hash";
        }
      } else {
        throw "No response";
      }
    } catch (e) {
      console.log("thisiserror")
      console.log(e);
    } finally {
      console.log('eh')
      dispatch(setPinning(false));
      dispatch(setMinting(true));
    }
  }

  const uploadPhoto = async (file: any) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        dispatch(setFile(file[0]));
        setImage(reader.result);
      }
    }
    console.log(file[0]);
    reader.readAsDataURL(file[0]);
  }

  return (
    <div className="flex flex-col w-1/2 p-2 align-middle justify-center ">
      <div className="flex w-96 h-96 border-2 border-indigo-50 self-center justify-center ">
        <img 
          src={image ? image : './images/placeholder_image.png'} 
          className={image ? "" : "w-20 h-20  self-center"}
          alt="uploaded file"
        ></img>
      </div>
      <input
        hidden
        type="file"
        id="file"
        accept="image/png, image/jpeg, image/jpg"
        onChange={async (e) => await uploadPhoto(e.target.files)}
      />
      <button className={buttonClass} onClick={async () => { await upload() }}>Mint</button>
    </div>
  )
}

let buttonClass =
  " flex m-4 px-4 py-1 blur-xl self-center" +
  " text-pink-400 " +
  " bg-gray-800 border-2 border-pink-400 "
