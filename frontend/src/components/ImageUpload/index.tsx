import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectFile } from "../../features/mintForm/selectors";
import { setFile } from "../../features/mintForm/slice";

export const ImageUpload = () => {

  const dispatch = useDispatch();
  const image = useSelector(selectFile);

  let upload = async () => {
    try {

    } catch (e) {

    } finally {

    }
  }
  const uploadPhoto = async (file: any) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        dispatch(setFile(reader.result));
        console.log(reader.result);
      }
    }
    console.log(file[0]);
    reader.readAsDataURL(file[0]);
  }

  return (
    <div className="flex flex-col w-1/2 p-2 align-middle justify-center ">
      <div className="flex w-96 h-96 border-2 border-indigo-50 self-center">
        <img src={image} alt="uploaded file"></img>
      </div>
      <input
        hidden
        type="file"
        id="file"
        accept="image/png, image/jpeg, image/jpg"
        onChange={async (e) => await uploadPhoto(e.target.files)}
      />
      <button className={buttonClass}>Mint</button>
    </div>
  )
}

let buttonClass =
  " flex m-4 px-4 py-1 blur-xl w-38 self-center" +
  " text-lg text-indigo-50 " +
  " bg-gray-800 border-2 border-indigo-50 "
