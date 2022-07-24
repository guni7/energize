(* types *)

(* approve types *)

type allow_param = {
  spender : address;
  value : nat;
}
type transfer_param = unit

type storage = unit

(* getPrice types *)

type get_price_param = nat set

(* getPrice types *)

type update_interest_param = nat 

(* getPrice types *)
type mint_param = 
  [@layout:comb]
  {
    token_id: nat ; 
    amount: nat ;
    min_received: nat ;
  }

(* updateAndMint types *)
type update_and_mint_param = {
  token_id : nat;
  token_amount : nat;
  min_received : nat;
}

type params = 
  | Approve of allow_param
  | GetPrice of get_price_param
  | UpdateInterest of update_interest_param
  | Mint of mint_param
  | UpdateAndMint of update_and_mint_param

(* functions *)

(* approve functions *)
let allowance_zero: operation = 
  let yupana_protocol_contract : address = ("KT1PW3aKxfB89HUrq8ywnw9tLvxtuHLgsjJW": address) in
  let token_contract : allow_param contract = match (Tezos.get_entrypoint_opt ("%approve") ("KT1Wgp6qSsDN7mCaDk5XDEQU52MezE8B9mr5" : address) : allow_param contract option) with 
    Some contract -> contract
  | None -> (failwith "AssetContractParamNotFound" : allow_param contract) in
  let allow_p : allow_param = {
    spender = yupana_protocol_contract;
    value = 0n; 
  } in
  Tezos.transaction allow_p 0tez token_contract 

let approve_internal (_token_address, token_amount : address * nat) : operation = 
  let yupana_protocol_contract: address = ("KT1PW3aKxfB89HUrq8ywnw9tLvxtuHLgsjJW": address) in
  let token_contract : allow_param contract = match (Tezos.get_entrypoint_opt ("%approve") ("KT1Wgp6qSsDN7mCaDk5XDEQU52MezE8B9mr5" : address) : allow_param contract option) with 
    Some contract -> contract
  | None -> (failwith "AssetContractParamNotFound" : allow_param contract) in
  let allow_p : allow_param = {
    spender = yupana_protocol_contract;
    value = token_amount
  } in
  Tezos.transaction allow_p 0tez token_contract 

let approve (token_address, token_amount, storage : address * nat * storage) : operation list * storage = 
  let op : operation = approve_internal (token_address,token_amount) in
  ([op], storage)

(* getPrice functions *)

let get_price_internal (token_id_set: get_price_param): operation =
  let contract_address: address = ("KT1MZeSimmt1A3omsJXjKy9ihma1ajUPqD4m" : address) in 
  let pf_router_contract : nat set contract = match (Tezos.get_entrypoint_opt ("%getPrice") (contract_address): nat set contract option) with 
    Some contract -> contract
  | None -> (failwith "PFRouterContractNotFound" : nat set contract) in
  Tezos.transaction token_id_set 0tez pf_router_contract

let get_price (token_id_set, storage: get_price_param * storage) : operation list * storage = 
  let op = get_price_internal token_id_set in
  ([op], storage)

(* updateInterest functions *)

let update_interest_internal (token_id : update_interest_param) : operation = 
  let yupana_contract_address : address = ("KT1PW3aKxfB89HUrq8ywnw9tLvxtuHLgsjJW": address) in
  let yupana_contract : nat contract = match (Tezos.get_entrypoint_opt ("%updateInterest") (yupana_contract_address) : nat contract option) with 
    Some contract -> contract 
  | None -> (failwith "YupanaContractNotFound" : nat contract) in
  Tezos.transaction token_id 0tez yupana_contract

let update_interest (token_id , storage : update_interest_param * storage) : operation list * storage = 
  let op : operation = update_interest_internal token_id in
  ([op], storage)

(* mint functions *)
let mint_internal (param : mint_param) : operation = 
  let yupana_contract_address : address = ("KT1PW3aKxfB89HUrq8ywnw9tLvxtuHLgsjJW": address) in
  let yupana_contract : mint_param contract = match (Tezos.get_entrypoint_opt ("%mint") (yupana_contract_address) : mint_param contract option) with 
    Some contract -> contract 
  | None -> (failwith "YupanaContractNotFound" : mint_param contract) in
  Tezos.transaction param 0tez yupana_contract

let mint (param, storage : mint_param * storage) : operation list * storage = 
  let op = mint_internal param in
  ([op], storage)


let update_and_mint (param, storage: update_and_mint_param * storage) : operation list * storage = 
  let token_id = param.token_id in
  let token_id_set : nat set = Set.literal [token_id] in
  let safe_allowance_transaction : operation = allowance_zero in
  let approve_transaction : operation = approve_internal (("KT1Wgp6qSsDN7mCaDk5XDEQU52MezE8B9mr5": address), param.token_amount) in 
  let get_price_transaction: operation = get_price_internal token_id_set in
  let update_interest_transaction: operation = update_interest_internal token_id in
  let mint_param: mint_param = {
    token_id = token_id ; 
    amount = 90000000000000000000n ;
    min_received = 1n;
  } in
  let mint_transaction: operation = mint_internal mint_param in
  ([safe_allowance_transaction; approve_transaction; get_price_transaction; update_interest_transaction; mint_transaction], storage)

let main (params, storage : params * storage) = 
  match params with 
  | Approve p -> approve (p.spender, p.value, storage)
  | GetPrice p -> get_price(p, storage)
  | UpdateInterest p -> update_interest (p, storage)
  | Mint p -> mint (p, storage)
  | UpdateAndMint p -> update_and_mint(p, storage)

