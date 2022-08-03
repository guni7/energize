import {
    configureStore,
    //getDefaultMiddleware,
    combineReducers,
} from "@reduxjs/toolkit";
import tezosReducer from "../features/tezos/slice";
import mintFormReducer from "../features/mintForm/slice"

const rootReducer = combineReducers({
    tezos: tezosReducer,
    mintForm: mintFormReducer,
})
export const store = configureStore({
    reducer: rootReducer,
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;