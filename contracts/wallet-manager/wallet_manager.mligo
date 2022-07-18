#include "./errors.mligo" "Errors"

type invst_token_id = nat
type token_id = nat
type token_amount = nat

type token_address = address
type wallet_manager_address = address

type storage = {
  owner_wallet_map : (token_address * token_id, smart_wallet_address) big_map;
  tokens : token_app_id;
  latest_owner_balance : address * nat;
}

type energize_param = {
  token_address : token_address;
  token_id : token_id;
  invst_token_id : nat;
  amount : nat ;
}
type return = operation list * storage

type get_wallet_address_param = {
  token_address: token_address;
  token_id : token_id;
}

type create_smart_wallet_param = {
  token_address : token_address;
  token_id: nat;
  wallet_manager_address : wallet_manager_address;
}

type withdraw_fa12_param = {
  token_address : asset_address;
  token_id : token_id;
  receiver_address : address;
  invst_token_address : invst_token_address;
  amount : nat;
  withdrawer : address;
}

type balance_of_request = [@layout:comb]{
  owner : address;
  token_id : token_id;
}

type balance_of_response = [@layout:comb]{
  request : balance_of_request_param;
  balance : nat;
}

type balance_of_query_param = {
  token_address : address;
  requests : balance_of_request list;
}

type withdraw_fa12_wallet_param = {
  receiver_address : address;
  invst_token_address : invst_token_address;
  amount : nat;
}
type parameter = 
  GetWalletAddress of get_wallet_address_param
  | WithdrawFa12 of withdraw_fa12_param
  | CreateSmartWallet of create_smart_wallet_param

[@view]
let get_wallet_address (p, s : get_wallet_address_param * storage) : smart_wallet_address = 
  let addr : smart_wallet_address = match (Big_map.find_opt (p.token_address, p.token_id) s.owner_wallet_map) with
    | None -> (failwith Errors.WALLET_NOT_FOUND)
    | Some addr -> addr in
  addr 

let create_smart_wallet (p,s : create_smart_wallet_param * storage) : return = 

  ([], s)

let balance_of_query (p,s : balance_of_query_param * storage) : return = 
  let cb_opt : balance_of_response list contract option = Tezos.get_entrypoint_opt "%balanceOfResponse" Tezos.get_self_address in
  let cb = match cb_opt with
    | None -> (failwith "NO_RESPONSE_ENTRYPOINT" : balance_of_response list contract)
    | Some ep -> ep in
  let bp : balance_of_query_param = {
    requests = q.requests;
    callback = cb;
  } in
  let fa2 : balance_of_query_param contract option = Tezos.get_entrypoint_opt "%balance_of" p.token_address in
  let q_op = match fa2 with
    | None -> (failwith "NO_BALANCE_OF_ENTRYPOINT" : operation)
    | Some ep -> Tezos.transaction bp 0mutez ep in
  ([q_op], s)

let balance_of_response (p,s : balance_of_response * storage) : return = 
  let bal : (address * nat) = match p with 
  | []  -> (failwith "Invalid Balance")
  | x :: _xs -> x in 
  ([] : operation list), s with { latest_owner_balance = bal } 


let withdraw_fa12 (p,s : withdraw_fa12_param * storage) : return = 
  if p.withdrawer, 1 <> s.latest_owner_balance then failwith Errors.ONLY_OWNER_CAN_WITHDRAW 
  else 
    let smart_wallet_address : smart_wallet_address = match (Big.find_opt (p.token_address, p.token_id) s.owner_wallet_map) with 
      | None -> (failwith Errors.WALLET_NOT_FOUND) 
      | Some wlt -> wlt  in 
    let smart_wallet_contract : withdraw_fa12_wallet_param contract = match (Tezos.get_entrypoint_opt "withdrawFa12" smart_wallet_address) with 
    | None -> (failwith Errors.WALLET_CONTRACT_NOT_FOUND)
    | Some ctr -> ctr in 
    let withdraw : withdraw_fa12_wallet_param = {
      receiver_address = p.withdrawer;
      invst_token_address = p.invst_token_address;
      amount = p.amount;
    } in
    let tr : operation = Tezos.transaction withdraw 0tez smart_wallet_contract in
([], s)

let main (param, storage: parameter * storage) : return = match param with
  | CreateSmartWallet p -> create_smart_wallet p, storage
  | WithdrawFa12 p -> withdraw_fa12 p, storage