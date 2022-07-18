 #import "./errors.mligo" "Errors"

type asset_address = address
type wallet_manager_address = address
type smart_wallet_address = address
type invst_token_address = address

type invst_token_id = nat
type token_id = nat 

type fa12 = "fa12"
type fa2 = "fa2"

type token_type = FA12 of fa12 | FA2 of fa2

type invst_token_details = {
  token_address : invst_token_address;
  token_type : token_type;
  balance : nat;
  decimals : nat;
}

type get_balance = address * (nat contract)

type storage = {
  wallet_manager_map : (invst_token_id, wallet_manager_address) big_map; 
  settings_map : (asset_address, wallet_manager_address) big_map;
  tokens : (invst_token_id, invst_token_details) big_map;
}

type transfer_param_fa12 = [@layout:comb] {
  from: address;
  to : address;
  value: nat
}

type energize_param = {
  token_address : asset_address ;
  token_id : token_id;
  invst_token_id : invst_token_id;
  amount : nat ;
}

type energize_with_interest_param = {
  token_address : asset_address ;
  token_id : token_id;
  invst_token_id : invst_token_id;
  amount : nat ;
}
type get_wallet_address_param = {
  token_address: token_address;
  token_id : token_id
}


type parameter = 
  Energize of energize_param
  | EnergizeWithInterest of energize_with_interest_param 
  | WithdrawFa12 of withdraw_fa12_param

(* functions to impl - 
  energize - add assets to nfts 
*)

type return = operation list * storage


let energize (p, s : energize_param * storage) : return = 
  (* validation here*)
  let wallet_manager : wallet_manager_address = match (Big_map.find_opt p.invst_token_id s.wallet_manager_map) with
    | None -> (failwith Errors.WALLET_MANAGER_NOT_FOUND : wallet_manager_address) 
    | Some addr -> addr in

  (*collect $$$*)
  let invst_tkn_deets : invst_token_details = match (Big_map.find_opt p.invst_token_id s.tokens) with 
  | None -> (failwith Errors.INVESTMENT_TOKEN_NOT_FOUND)
  | Some d -> d in
  let invst_tkn_contract : transfer_param_fa12 contract = match (Tezos.get_entrypoint_opt ("%transfer") (invst_tkn_deets.token_address) : transfer_param_fa12 contract option) with
  | None -> (failwith Errors.INVESTMENT_TOKEN_CONTRACT_NOT_FOUND)
  | Some ctr -> ctr in
  let self_transfer_param : transfer_param_fa12 = {
    from = Tezos.sender;
    to = Tezos.self_address;
    amount = p.amount; (* add fees here*)
  } in
  let transfer_to_self_txn : operation = Tezos.transaction self_transfer_param 0tez invst_tkn_contract in

  (*transfer funds to smart wallet *)

  (* get wallet id *) 
  let wallet_key : get_wallet_address_param = {
    token_address = p.asset_address; 
    token_id = p.token_id;
  } in
  let smart_wallet_address : smart_wallet_address = match (Tezos.call_view "get_wallet_address" wallet_key wallet_manager) with
    | None -> (failwith Errors.SMART_WALLET_NOT_FOUND)  (* Create Smart Wallet *)
    | Some addr -> addr in 
  let wallet_transfer_param : transfer_param_fa12 = {
    from = Tezos.self_address;
    to = smart_wallet_address;
    amount = p.amount; 
  } in
  let transfer_to_wallet_txn : operation = Tezos.transaction wallet_transfer_param 0tez invst_tkn_contract in
  ([transfer_to_self_txn, transfer_to_wallet_txn],s)


let energize_with_interest (p,s : energize_with_interest_param * storage) : return = 
  (**)
  ([], s)

type withdraw_fa12_param = {
  token_address : asset_address;
  token_id : token_id;
  receiver_address : address;
  invst_token_address : invst_token_address;
  amount : nat;
}

type withdraw_fa12_mgr_param = {
  token_address : asset_address;
  token_id : token_id;
  receiver_address : address;
  invst_token_address : invst_token_address;
  amount : nat;
  withdrawer : address;
}
let withdraw_fa12 (p,s : withdraw_fa12_param * storage) : return = 
  (*send withdraw request to wallet manager*)
  let wallet_manager : wallet_manager_address = match (Big_map.find_opt p.invst_token_id s.wallet_manager_map) with
    | None -> (failwith Errors.WALLET_MANAGER_NOT_FOUND : wallet_manager_address) 
    | Some addr -> addr in
  let wallet_mgr_contract : withdraw_fa12_mgr_param contract = match (Tezos.get_entrypoint_opt "%withdraw_fa12" wallet_manager : withdraw_fa12_mgr_param contract option) with 
    | None -> (failwith Errors.WALLET_MANAGER_CONTRACT_NOT_FOUND)
    | Some ctr -> ctr in 
  let withdraw_fa12_mgr_param : withdraw_fa12_mgr_param = {
    token_address = p.token_address;
    token_id = p.token_id;
    receiver_address = p.receiver_address;
    invst_token_address = p.invst_token_address;
    amount = p.amount;
  } in 
  let tr : operation = Tezos.transaction p 0tez wallet_mgr_contract in
  ([tr], s)

let main (param, storage : parameter * storage) : return = 
  match param with
  | Energize p -> ([], storage)
