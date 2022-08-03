import { createSlice } from '@reduxjs/toolkit'
import { BeaconWallet } from '@taquito/beacon-wallet';
import { TezosToolkit } from '@taquito/taquito'
import { AvailableToken, TezosAccountAddress, TezosContractAddress, TokenContract, TokenBalanceInfo} from '../../types';


export type TezosState = {
    Tezos: TezosToolkit,
    contract: any,
    wallet: BeaconWallet | null,
    userAddress: TezosAccountAddress | undefined,
    userBalance: number,
    storage: any,
    beaconConnection: boolean,
    contractAddress: TezosContractAddress,
    publicToken: string,
    tokens: { [p in AvailableToken]: TokenContract } | undefined;
    tokenBalances: TokenBalanceInfo[],
    //userProfile: UserProfile | null;
}
export const initialState: TezosState = {
    Tezos: new TezosToolkit("https://ithacanet.ecadinfra.com"),
    contract: undefined,
    wallet: null,
    userAddress: undefined,
    userBalance: 0,
    storage: null,
    beaconConnection: false,
    contractAddress: "KT1Dqf7SEVMjJ8xNvWEuQmn2ffiWoFc9bkkZ",
    publicToken: "",
    tokens: undefined,
    tokenBalances: [],
    //userProfile: null
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
        setStorage: (state, action) => {
            state.storage = action.payload
        },
        setBeaconConnection: (state, action) => {
            state.beaconConnection = action.payload
        },
        setPublicToken: (state, action) => {
            state.publicToken = action.payload
        },
        setTokens: (state, action) => {
            state.tokens = action.payload
        },
        setTokenBalances: (state, action) => {
            state.tokenBalances = action.payload
        },
        //setUserProfile: (state, action) => {
        //    state.userProfile = action.payload;
        //}
    }
});
export const {
    setTezos,
    setContract,
    setWallet,
    setUserAddress,
    setUserBalance,
    setStorage,
    setBeaconConnection,
    setPublicToken,
    setTokens,
    setTokenBalances,
    //setUserProfile
} = tezosSlice.actions;

export default tezosSlice.reducer;
