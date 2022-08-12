import { useSelector } from "react-redux"
import Navbar from "../components/Navbar"
import { selectBeaconConnection } from "../features/tezos/selectors";
import Mint from "./Mint"

export const Home = () => {
    const beaconConnection = useSelector(selectBeaconConnection);

    return (
        <div className="bg-gray-800 h-screen">
            {beaconConnection ?
                <Mint />
                :
                <div className="flex flex-col">
                    <Navbar />
                    <div className="text-4xl text-pink-400 self-center justify-self-center mt-56">
                        connect wallet to 
                    </div>``
                    <div className="text-6xl text-pink-400 self-center justify-self-center">
                        energize
                    </div>
                </div>
            }
        </div>
    )
}

