
type invst_token_address = address
type token_address = address
type wallet_manager_address = address
type token_id = nat 

type token_details = {
  invst_token_address : invst_token_address;
  balance : nat;
  decimals : nat;
}

type storage = {
  wallet_manager : wallet_manager_address;
  nft_address : token_address * token_id;
  token_balances_fa12 : (invst_token_address, token_details) map;
}

type return = operation list * storage

type transfer_param_fa12 = [@layout:comb] {
  from: address;
  to : address;
  value: nat;
}

type withdraw_fa12_param = {
  receiver_address : address;
  invst_token_address : invst_token_address;
  amount : nat;
}
(*
type withdraw_fa2_param = {
}

type withdraw_tez_param = {
}
*)

type parameter = WithdrawFa12 of withdraw_fa12_param

let withdraw_fa12 (p,s : withdraw_fa12_param * storage) : return = 
  if Tezos.get_sender() <> s.wallet_manager then (failwith "ONLY_WALLET_MANAGER_ALLOWED")
  else 
    let invst_tkn_contract : transfer_param_fa12 contract = match (Tezos.get_entrypoint_opt ("%transfer") (p.invst_token_address) : transfer_param_fa12 contract option) with
    | None -> (failwith "INVESTMENT_TOKEN_CONTRACT_NOT_FOUND")
    | Some ctr -> ctr in
    let transfer_param : transfer_param_fa12 = {
      from = p.receiver_address;
      to = Tezos.get_self_address();
      value = p.amount; 
    } in
    let transfer_txn : operation = Tezos.transaction transfer_param 0tez invst_tkn_contract in
    let new_wallet_map = s in (* TODO *)
    ([transfer_txn], new_wallet_map)

let main (param, storage : withdraw_fa12_param * storage) : return = withdraw_fa12 (param, storage)
