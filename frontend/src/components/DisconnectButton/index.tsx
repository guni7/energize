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
            <button onClick={disconnectWallet} className={buttonClass}>
                {`${userAddress?.slice(0,10)}.....`}
            </button>
        </div>
    )
}

export default DisconnectButton;

let buttonClass =
  " px-4 py-1 blur-xl" +
  " text-lg text-pink-400 font-semibold" +
  " rounded border-2 border-pink-400" +
  " hover:text-black hover:bg-pink-400 hover:border-transparent"