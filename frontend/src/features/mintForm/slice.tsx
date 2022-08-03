import { createSlice } from '@reduxjs/toolkit'
import { BeaconWallet } from '@taquito/beacon-wallet';

export type TezosState = {
  title: string,
  description: string
  file : any
}
export const initialState: TezosState = {
  title: "",
  description: "",
  file: null
  //userProfile: null
}

const mintFormSlice = createSlice({
  name: 'mintForm',
  initialState: initialState,
  reducers: {
    setTitle: (state, action) => {
      state.title = action.payload;
    },
    setDescription: (state, action) => {
      state.description = action.payload;
    },
    setFile: (state, action) => {
      state.file = action.payload;
    },
  }
});
export const {
  setTitle,
  setDescription,
  setFile
  //setUserProfile
} = mintFormSlice.actions;

export default mintFormSlice.reducer;
