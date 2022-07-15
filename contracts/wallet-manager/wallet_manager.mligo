#include "./errors.mligo" "Errors"

type invst_token_id = nat
type token_id = nat
type token_amount = nat

type token_address = address

type storage = {
  owner_wallet_map : (token_address * token_id, smart_wallet_address) big_map;
  tokens : token_app_id
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
  token_id : token_id
}

type parameter = 
  GetWalletAddress of get_wallet_address_param

[@view]
let get_wallet_address (p, s : get_wallet_address_param * storage) : smart_wallet_address = 
  let addr : smart_wallet_address = match (Big_map.find_opt (p.token_address, p.token_id) s.owner_wallet_map) with
    | None -> (failwith Errors.WALLET_NOT_FOUND)
    | Some addr -> addr in
  addr 
    

  



