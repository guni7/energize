import { useDispatch, useSelector } from "react-redux";
import { selectDescription, selectTitle } from "../../features/mintForm/selectors";
import { setDescription, setTitle } from "../../features/mintForm/slice";

export const MintForm = () => {
  // title , description, creator

  const dispatch = useDispatch();
  const description = useSelector(selectDescription);
  const title = useSelector(selectTitle);

  const descChange = (e : any) => {
    dispatch(setDescription(e.target.value));
  }

  const titleChange = (e : any) => {
    dispatch(setTitle(e.target.value));
  }
  return (
    <div className="flex flex-col w-1/2 ml-16 self-center items-center">
      <div className="flex w-full justify-between " >
        <label className="flex text-indigo-50 align-center ml-6 mt-6 " htmlFor="upload"> Choose a file jpeg/png accepted</label>
        <button name="upload" className={buttonClass}>
          <label htmlFor="file">
            Choose File
          </label>
        </button>
      </div>
      <label htmlFor="title" className={labelClassName}> Title </label>
      <input type="text" name="title" className={textInputClass} placeholder="Max 500 characters" value={title} onChange={e => titleChange(e)}></input>
      <label htmlFor="description" className={labelClassName}> Description </label>
      <textarea name="description" className={textInputClass} placeholder="Max 5000 characters" value={description} onChange={e => descChange(e)}></textarea>
    </div >
  )
}

let buttonClass =
  " flex m-4 px-4 py-1 self-end" +
  " text-pink-400 " +
  " bg-gray-800  border-2  border-pink-400 border-dotted"

let textInputClass =
  "p-4 h-12 bg-gray-800 border-b-2 border-indigo-50 text-indigo-50 w-full" +
  " focus:outline-none "

let labelClassName =
  "text-indigo-50 ml-4 mt-8 self-start"