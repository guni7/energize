import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "../../app/store";
import { initialState } from "./slice";

const mintFormSlice = (state: RootState) => state.mintForm || initialState;

export const selectTitle = createSelector([mintFormSlice], (state: any) => state.title);
export const selectDescription = createSelector([mintFormSlice], (state: any) => state.description);
export const selectFile = createSelector([mintFormSlice], (state: any) => state.file);
