import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "../../app/store";
import { initialState } from "./slice";

const tezosSlice = (state: RootState) => state.tezos || initialState;

export const selectTezos = createSelector([tezosSlice], state => state.Tezos);

export const selectContract = createSelector([tezosSlice], state => state.contract);

export const selectWallet = createSelector([tezosSlice], state => state.wallet);

export const selectUserAddress = createSelector([tezosSlice], state => state.userAddress);

export const selectUserBalance = createSelector([tezosSlice], state => state.userBalance);

export const selectStorage = createSelector([tezosSlice], state => state.storage);

export const selectBeaconConnection = createSelector([tezosSlice], state => state.beaconConnection);

export const selectContractAddress = createSelector([tezosSlice], state => state.contractAddress);

export const selectPublicToken = createSelector([tezosSlice], state => state.publicToken);

export const selectTokens = createSelector([tezosSlice], state => state.tokens);

export const selectTokenBalances = createSelector([tezosSlice], state => state.tokenBalances);

//export const selectUserProfile = createSelector([tezosSlice], state => state.userProfile);
