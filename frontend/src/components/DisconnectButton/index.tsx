import { useDispatch, useSelector } from "react-redux";
import { selectUserAddress, selectWallet, selectUserBalance } from "../../features/tezos/selectors";
import { setUserAddress, setUserBalance, setPublicToken, setWallet, setBeaconConnection, setTezos} from "../../features/tezos/slice";
import { TezosToolkit } from "@taquito/taquito";

const DisconnectButton = () => {

    const dispatch = useDispatch();
    const wallet = useSelector(selectWallet);
    const userAddress = useSelector(selectUserAddress);
    const balance = useSelector(selectUserBalance);
    const disconnectWallet = async () => {

        dispatch(setUserAddress(""));
        dispatch(setUserBalance(0));
        dispatch(setWallet(null));
        const tezosTK = new TezosToolkit("https://ithacanet.ecadinfra.com");
        dispatch(setTezos(tezosTK));
        dispatch(setBeaconConnection(false));
        dispatch(setPublicToken(null));
        if (wallet) {
            await wallet.client.removeAllAccounts();
            await wallet.client.removeAllPeers();
            await wallet.client.destroy();
        }
    }
    return (
        <div>
            <button onClick={disconnectWallet} className="px-4 py-1 text-md text-blue-600 font-semibold rounded-full border border-blue-400 hover:text-white hover:bg-blue-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">
                {userAddress}
            </button>
        </div>
    )
}

export default DisconnectButton;