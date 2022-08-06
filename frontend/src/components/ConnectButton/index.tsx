import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectTezos,
  selectWallet,
} from "../../features/tezos/selectors";
import {
  setUserAddress,
  setUserBalance,
  setBeaconConnection,
  setWallet,
  setPublicToken,
} from "../../features/tezos/slice";
import {
  BeaconEvent,
  defaultEventCallbacks,
  NetworkType,
} from "@airgap/beacon-sdk";
import { selectContract as selectMktContract } from "../../features/marketplace/selectors";
import { BeaconWallet } from "@taquito/beacon-wallet";
import {  TezosAccountAddress } from "../../types";
import { setStorage as setMktStorage } from "../../features/marketplace/slice";

const ConnectButton = (): JSX.Element => {
  const dispatch = useDispatch();
  const Tezos = useSelector(selectTezos);
  const wallet = useSelector(selectWallet);
  const mktContractAddress = useSelector(selectMktContract)

  const [publicTkn, setPublicTkn] = useState<string | null>("");

  const setup = async (userAddress: TezosAccountAddress): Promise<void> => {
    dispatch(setUserAddress(userAddress));

    const balance = await Tezos.tz.getBalance(userAddress);

    dispatch(setUserBalance(balance.toNumber()));

    //const mktContract = await Tezos.wallet.at(mktContractAddress);
    //const mktStorage: any = await mktContract.storage();
    //dispatch(setMktStorage(mktStorage));
  };

  const connectWallet = async () => {
    try {
      await wallet?.requestPermissions({
        network: {
          type: NetworkType.CUSTOM,
          rpcUrl: "https://ithacanet.ecadinfra.com",
        },
      });
      const userAddress = await wallet?.getPKH() as TezosAccountAddress;
      if (userAddress) {
        await setup(userAddress);
      }
      dispatch(setBeaconConnection(true));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    (async () => {
      const wallet = new BeaconWallet({
        name: "energize",
        preferredNetwork: NetworkType.CUSTOM,
        disableDefaultEvents: true,
        eventHandlers: {
          [BeaconEvent.PAIR_INIT]: {
            handler: defaultEventCallbacks.PAIR_INIT,
          },
          [BeaconEvent.PAIR_SUCCESS]: {
            handler: (data) => setPublicTkn(data.publicKey),
          },
        },
      });
      Tezos.setWalletProvider(wallet);
      dispatch(setWallet(wallet));

      const activeAccount = await wallet.client.getActiveAccount();
      if (activeAccount) {
        const userAddress = await wallet.getPKH() as TezosAccountAddress;
        await setup(userAddress);
        dispatch(setBeaconConnection(true));
      }
    })();
  }, []);

  useEffect(() => {
    dispatch(setPublicToken(publicTkn));
  }, [setPublicTkn]);

  return (
        <button
          onClick={connectWallet}
          className={buttonClass}
        >
          Connect Wallet
        </button>
  );
};

export default ConnectButton;

let buttonClass =
  " px-4 py-1 blur-xl" +
  " text-lg text-pink-400 font-semibold" +
  " rounded border-2 border-pink-400" +
  " hover:text-black hover:bg-pink-400 hover:border-transparent"