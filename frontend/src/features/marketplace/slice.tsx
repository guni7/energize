import { createSlice } from '@reduxjs/toolkit'
import { TezosContractAddress } from '../../types';

export type MarketplaceState = {
  contract: TezosContractAddress,
  storage: any,
  pinning: boolean,
  minting: boolean
}

export const initialState: MarketplaceState = {
  contract: "KT1JUdFQk26him1fKFTiTZ9gVbkRNij8V2fZ",
  storage: null,
  pinning: false,
  minting: false
}

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState: initialState,
  reducers: {
    setStorage: (state, action) => {
      state.storage = action.payload;
    },
    setPinning: (state, action) => {
      state.pinning = action.payload;
    },
    setMinting: (state, action) => {
      state.minting = action.payload;
    },
  }
});
export const {
  setStorage,
  setMinting,
  setPinning
} = marketplaceSlice.actions

export default marketplaceSlice.reducer;
