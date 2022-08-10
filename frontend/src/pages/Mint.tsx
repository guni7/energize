import { ImageUpload } from "../components/ImageUpload";
import { MintForm } from "../components/MintForm";
import Navbar from "../components/Navbar";


const Mint = () => {
  return (
    <div>
      <Navbar />
      <div className="flex flex-row w-full -mt-16 h-screen bg-gray-800">
        <MintForm />
        <ImageUpload />
      </div>
    </div>
  )
}

export default Mint;

