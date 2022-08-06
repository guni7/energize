import { useSelector } from "react-redux"
import Navbar from "../components/Navbar"
import Mint from "./Mint"

export const Home = () => {

    return (
        <div className="bg-gray-900 h-screen">
            <Mint />
        </div>
    )
}

