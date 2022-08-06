import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "../../app/store";
import { initialState } from "./slice";

const marketplaceSlice = (state: RootState) => state.mintForm || initialState;

export const selectContract = createSelector([marketplaceSlice], (state: any) => state.contract);

export const selectStorage = createSelector([marketplaceSlice], (state: any) => state.storage);

export const selectPinning = createSelector([marketplaceSlice], (state: any) => state.pinning);

export const selectMinting = createSelector([marketplaceSlice], (state: any) => state.minting);