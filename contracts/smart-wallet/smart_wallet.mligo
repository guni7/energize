#include "./errors.mligo" "Errors"

type invst_token_address = address

type token_details = {
  invst_token_address : address;
  balance : nat;
  decimals : nat;
}

type storage = {
  wallet_manager : address;
  nft_address : address;
  token_balances_fa12 : (token_id, token_details) map;
}

type return = operation list * storage

type transfer_param_fa12 = [@layout:comb] {
  from: address;
  to : address;
  value: nat
}

type withdraw_fa12_param = {
  receiver_address : address;
  invst_token_address : invst_token_address;
  amount : nat;
}

type withdraw_fa2_param = {

}

type withdraw_tez_param = {

}

type parameter = 
  | WithdrawFa12 of withdraw_fa12_param
  | WithdrawFa2 of withdraw_fa12_param
  | WithdrawTez of withdraw_tez

let withdraw_fa12 (p,s : withdraw_fa12_param * storage) : return = 
  if Tezos.get_sender <> wallet_manager_address then (failwith Errors.ONLY_WALLET_MANAGER_ALLOWED)
  else 
    let invst_tkn_contract : transfer_param = match (Tezos.get_entrypoint_opt ("%transfer") (p.invst_token_address) : transfer_param_fa12 contract option) with
    | None -> (failwith Errors.INVESTMENT_TOKEN_CONTRACT_NOT_FOUND)
    | Some ctr -> ctr in
    let transfer_param : transfer_param_fa12 = {
      to = Tezos.self_address;
      from = p.receiver_address;
      amount = p.amount; 
    } in
    let transfer_txn : operation = Tezos.transaction transfer_param 0tez invst_tkn_contract in
    ([transfer_txn], s)

let main (param, storage : parameter * storage) : return = 
  match param with 
  | WithdrawFa12 p -> withdraw_fa12 p, storage
