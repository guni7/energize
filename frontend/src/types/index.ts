import type { TezosToolkit, WalletOperation } from "@taquito/taquito";
import type { BeaconWallet } from "@taquito/beacon-wallet";

export type TezosAccountAddress = `tz${"1" | "2" | "3"}${string}`;
export type TezosContractAddress = `KT1${string}`;
