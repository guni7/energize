import type { TezosToolkit, WalletOperation } from "@taquito/taquito";
import type { BeaconWallet } from "@taquito/beacon-wallet";

export type TezosAccountAddress = `tz${"1" | "2" | "3"}${string}`;
export type TezosContractAddress = `KT1${string}`;

export enum AvailableToken {
  KUSD = "kUSD",
  HDAO = "hDAO",
  PLENTY = "PLENTY",
  xPLENTY = "xPLENTY",
  WXTZ = "wXTZ",
  STKR = "STKR",
  TZBTC = "tzBTC",
  USDTZ = "USDtz",
  ETHTZ = "ETHtz",
  CRUNCH = "CRUNCH",
  WRAP = "WRAP",
  wAAVE = "wAAVE",
  wBUSD = "wBUSD",
  wCEL = "wCEL",
  wCOMP = "wCOMP",
  wCRO = "wCRO",
  WDAI = "wDAI",
  wFTT = "wFTT",
  wHT = "wHT",
  wHUSD = "wHUSD",
  wLEO = "wLEO",
  wLINK = "wLINK",
  wMATIC = "wMATIC",
  wMKR = "wMKR",
  wOKB = "wOKB",
  wPAX = "wPAX",
  wSUSHI = "wSUSHI",
  wUNI = "wUNI",
  wUSDC = "wUSDC",
  wUSDT = "wUSDT",
  WWBTC = "wWBTC",
  wWETH = "wWETH",
  CRDAO = "crDAO",
  FLAME = "FLAME",
  KALAM = "KALAM",
  PAUL = "PAUL",
  SMAK = "SMAK",
  GOT = "GOT",
  HERA = "HERA",
  KDAO = "kDAO",
  QUIPU = "QUIPU",
  uUSD = "uUSD",
  YOU = "YOU",
  Ctez = "Ctez",
  MAG = "MAG",
  PXL = "PXL",
  pxlDAO = "pxlDAO",
  fDAO = "fDAO",
  BTCtz = "BTCtz",
  IDZ = "IDZ",
  GIF = "GIF",
  TezDAO = "TezDAO",
  uBTC = "uBTC",
  XTZ = "XTZ",
  OTHER = "OTHER"
}
export interface TokenContract {
  address: TezosContractAddress;
  dexContractAddress: TezosContractAddress;
  decimals: number;
  ledgerPath: string;
  ledgerKey: "address" | ["address", number] | [string, "address"];
  type: "fa1.2" | "fa2";
  color: string;
  exchangeRate: null | number; // token to XTZ
  tokenId?: number; // only for fa2 contracts;
  thumbnail?: string;
  websiteLink?: string;
}

export type IconValue = AvailableToken | "XTZ" | "QUIPUSWAP" | "crDAO" | "user";
export type IconSet = IconValue[];

export interface Operation {
  entryId: number;
  id: string;
  hash: string;
  level: number;
  timestamp: string;
  entrypoint: string;
  sender: { address: string; alias: string };
  target: { address: string; alias: string };
  amount: number;
  value: number;
  icons: IconSet;
  raw: any;
  tokenIds: number[] | null;
  status: "applied" | "failed" | "backtracked" | "skipped";
}

export interface State {
  network: "testnet" | "mainnet";
  currentLevel: number;
  Tezos: TezosToolkit;
  wallet: BeaconWallet;
  userAddress: TezosAccountAddress;
  settings: {
    testnet: {
      rpcUrl: string;
      validRpcUrls: { name: string; url: string }[];
    };
    mainnet: {
      rpcUrl: string;
      validRpcUrls: { name: string; url: string }[];
    };
  };
  tokens: { [p in AvailableToken]: TokenContract } | undefined;
  tokensBalances: TokenBalanceInfo[];
  lastOperations: Operation[];
  xtzData: {
    exchangeRate: undefined;
    balance: number;
    historic: [];
  };
  serviceFee: number;
  admin: TezosAccountAddress;
  defiData: string;
  blurryBalances: boolean;
}

export interface TokenBalanceInfo {
  address: TezosContractAddress,
  balance: number;
  decimals: number;
  icon: string;
  name: string;
  symbol: AvailableToken;
  type: string;
  isApproved: boolean;
}