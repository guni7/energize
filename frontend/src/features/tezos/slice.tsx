import { createSlice } from '@reduxjs/toolkit'
import { BeaconWallet } from '@taquito/beacon-wallet';
import { TezosToolkit } from '@taquito/taquito'
import { TezosAccountAddress, TezosContractAddress } from '../../types';


export type TezosState = {
    Tezos: TezosToolkit,
    contract: any,
    wallet: BeaconWallet | null,
    userAddress: TezosAccountAddress | undefined,
    userBalance: number,
    publicToken: string,
    beaconConnection: boolean,
    contractAddress: TezosContractAddress,
}
export const initialState: TezosState = {
    Tezos: new TezosToolkit("https://ghostnet.smartpy.io"),
    contract: undefined,
    wallet: null,
    userAddress: undefined,
    userBalance: 0,
    publicToken: "",
    beaconConnection: false,
    contractAddress: "KT1Dqf7SEVMjJ8xNvWEuQmn2ffiWoFc9bkkZ",
}

const tezosSlice = createSlice({
    name: 'tezos',
    initialState: initialState,
    reducers: {
        setTezos: (state, action) => {
            state.Tezos = action.payload;
        },
        setContract: (state, action) => {
            state.contract = action.payload
        },
        setWallet: (state, action) => {
            state.wallet = action.payload
        },
        setUserAddress: (state, action) => {
            state.userAddress = action.payload
        },
        setUserBalance: (state, action) => {
            state.userBalance = action.payload
        },
        setPublicToken: (state, action) => {
            state.publicToken = action.payload
        },
        setBeaconConnection: (state, action) => {
            state.beaconConnection = action.payload
        },
    }
});
export const {
    setTezos,
    setContract,
    setWallet,
    setUserAddress,
    setUserBalance,
    setPublicToken,
    setBeaconConnection,
} = tezosSlice.actions;

export default tezosSlice.reducer;
