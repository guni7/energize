import { ImageUpload } from "../components/ImageUpload";
import { MintForm } from "../components/MintForm";


const Mint = () => {
  return (
    <div className="flex flex-row w-full">
      <MintForm />
      <ImageUpload />
    </div>
  )
}

export default Mint;

