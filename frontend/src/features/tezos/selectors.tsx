import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "../../app/store";
import { initialState } from "./slice";

const tezosSlice = (state: RootState) => state.tezos || initialState;

export const selectTezos = createSelector([tezosSlice], state => state.Tezos);

export const selectWallet = createSelector([tezosSlice], state => state.wallet);

export const selectUserAddress = createSelector([tezosSlice], state => state.userAddress);

export const selectUserBalance = createSelector([tezosSlice], state => state.userBalance);

export const selectBeaconConnection = createSelector([tezosSlice], state => state.beaconConnection);

export const selectPublicToken = createSelector([tezosSlice], state => state.publicToken);

export const selectContractAddress = createSelector([tezosSlice], state => state.contractAddress);