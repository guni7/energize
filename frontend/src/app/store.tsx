import {
    configureStore,
    //getDefaultMiddleware,
    combineReducers,
} from "@reduxjs/toolkit";
import tezosReducer from "../features/tezos/slice";

const rootReducer = combineReducers({
    tezos: tezosReducer
})
export const store = configureStore({
    reducer: rootReducer,
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;