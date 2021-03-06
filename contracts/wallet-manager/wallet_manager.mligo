type invst_token_id = nat
type token_id = nat
type token_amount = nat

type token_address = address
type invst_token_address = address
type wallet_manager_address = address
type smart_wallet_address = address

type withdraw_fa12_param = {
  token_address : token_address;
  token_id : token_id;
  receiver_address : address;
  invst_token_address : invst_token_address;
  amount : nat;
  withdrawer : address; (* not needed *)
}

type storage = {
  owner_wallet_map : (token_address * token_id, smart_wallet_address) big_map;
  recent_balance_requests : (address * nat, address) big_map; (* owner_address * token_id, token_address *)
  withdraw_requests : (address * nat, withdraw_fa12_param) big_map;
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

type balance_of_request = [@layout:comb]{
  owner : address;
  token_id : nat;
}

type balance_of_response = [@layout:comb]{
  request : balance_of_request;
  balance : nat;
}

type balance_of_query_param = {
  requests : balance_of_request list;
  token_address : address;
  withdraw_fa12 : withdraw_fa12_param;
}

type transfer_param_fa12 = [@layout:comb] {
  from: address;
  to : address;
  value: nat
}

type balance_of_fa2 = [@layout:comb]
{
  requests : balance_of_request list;
  callback : (balance_of_response list) contract;
}

type withdraw_fa12_wallet_param = {
  receiver_address : address;
  invst_token_address : invst_token_address;
  amount : nat;
}

type token_details = {
  invst_token_address : address;
  balance : nat;
  decimals : nat;
}
type create_contract_result =
  [@layout:comb]
  { operation : operation;
    address : address }

type smart_wallet_storage = {
  wallet_manager : wallet_manager_address;
  nft_address : token_address * token_id;
  token_balances_fa12 : (invst_token_address, token_details) map;
}

type create_wallet_contract = 
  [@layout:comb]
  (* order matters because we will cross the Michelson boundary *)
    { delegate : key_hash option;
      balance : tez;
      storage : smart_wallet_storage;
    }

  type transfer_details = {
    invst_tkn_contract : transfer_param_fa12 contract;
    value : nat;
  }

  type create_and_call_smart_wallet_param = {
    create_contract : create_wallet_contract;
    transfer : transfer_details;
    token_address : token_address;
    token_id : token_id;
  }

  type create_smart_wallet_result =[@layout:comb]{
    create_op: operation;
    addr : address 
  }


  type parameter = 
    | WithdrawFa12 of withdraw_fa12_param
    | BalanceOfQuery of balance_of_query_param
    | BalanceOfResponse of balance_of_response list
    | CreateAndCallSmartWallet of create_and_call_smart_wallet_param

  [@view]
  let get_wallet_address (p, s : get_wallet_address_param * storage) : smart_wallet_address option = 
    let addr : smart_wallet_address option = Big_map.find_opt (p.token_address, p.token_id) s.owner_wallet_map in
    addr 

let balance_of_query (p,s : balance_of_query_param * storage) : return = 
    let slf_address : address = Tezos.get_self_address() in
    let cb_opt : balance_of_response list contract option = Tezos.get_entrypoint_opt "%balanceOfResponse" slf_address in
    let cb : balance_of_response list contract = match cb_opt with
      | None -> (failwith "NO_RESPONSE_ENTRYPOINT" : balance_of_response list contract)
      | Some ep -> ep in
    let bp : balance_of_fa2 = {
      requests = p.requests;
      callback = cb;
    } in
    let fa2 : balance_of_fa2 contract option = Tezos.get_entrypoint_opt "%balance_of" p.token_address in
    let q_op = match fa2 with
      | None -> (failwith "NO_BALANCE_OF_ENTRYPOINT" : operation)
      | Some ep -> Tezos.transaction bp 0mutez ep in
    let new_recent_balance_requests = Big_map.update (p.withdraw_fa12.withdrawer, (p.withdraw_fa12.token_id: nat)) (Some p.token_address) s.recent_balance_requests in
    let new_withdraw_requests = Big_map.update (p.withdraw_fa12.withdrawer, (p.withdraw_fa12.token_id: nat)) (Some p.withdraw_fa12) s.withdraw_requests in
    ([q_op], { s with recent_balance_requests = new_recent_balance_requests; withdraw_requests = new_withdraw_requests })

let balance_of_response (p,s : balance_of_response list * storage) : return = 
    let bal_res: balance_of_response = match p with 
    | []  -> (failwith "INVALID_BAL" : balance_of_response)
    | x :: _xs -> x in
    if bal_res.balance = 0n then failwith "ONLY_OWNER_CAN_TRANSFER" else
    let token_address : address = match (Big_map.find_opt (bal_res.request.owner, bal_res.request.token_id) s.recent_balance_requests) with 
      | None -> (failwith "NO_BALANCE_REQ_FOUND" : address)
      | Some addr -> addr in 
    if Tezos.get_sender() <> token_address then failwith "INCORRECT_TOKEN" else
    let withdraw_param : withdraw_fa12_param = match (Big_map.find_opt (bal_res.request.owner, bal_res.request.token_id) s.withdraw_requests) with
      | None -> (failwith "NO_WITHDRAW_REQ_FOUND" : withdraw_fa12_param)
      | Some wp -> wp in
    let transfer_tr_self = Tezos.transaction withdraw_param 0tez (Tezos.self "%withdrawFa12" : withdraw_fa12_param contract) in
    ([transfer_tr_self], s )


  let withdraw_fa12 (p,s : withdraw_fa12_param * storage) : return = 
    if Tezos.get_sender() <> Tezos.get_self_address() then failwith "ONLY_SELF_ALLOWED"
    else 
      let smart_wallet_address : smart_wallet_address = match (Big_map.find_opt (p.token_address, p.token_id) s.owner_wallet_map) with 
        | None -> (failwith "WALLET_NOT_FOUND" : smart_wallet_address) 
        | Some wlt -> wlt  in 
      let smart_wallet_contract : withdraw_fa12_wallet_param contract = match (Tezos.get_entrypoint_opt "%withdrawFa12" smart_wallet_address : withdraw_fa12_wallet_param contract option) with 
        | None -> (failwith "WALLET_CONTRACT_NOT_FOUND": withdraw_fa12_wallet_param contract)
        | Some ctr -> ctr in 
      let withdraw : withdraw_fa12_wallet_param = {
        receiver_address = p.withdrawer;
        invst_token_address = p.invst_token_address;
        amount = p.amount;
      } in
      let tr : operation = Tezos.transaction withdraw 0tez smart_wallet_contract in
      ([tr], s)


  [@inline]
  let create_smart_wallet = 
    [%Michelson ({|{ 
UNPAIR 3;
CREATE_CONTRACT
{ parameter
    (or (unit %def)
        (pair %withdrawFa12
           (pair (nat %amount) (address %invst_token_address))
           (address %receiver_address))) ;
  storage
    (pair (pair (pair %nft_address address nat)
                (map %token_balances_fa12
                   address
                   (pair (pair (nat %balance) (nat %decimals)) (address %invst_token_address))))
          (address %wallet_manager)) ;
  code { UNPAIR ;
         IF_LEFT
           { DROP ; NIL operation ; PAIR }
           { DUP 2 ;
             CDR ;
             SENDER ;
             COMPARE ;
             NEQ ;
             IF { DROP 2 ; PUSH string "ONLY_WALLET_MANAGER_ALLOWED" ; FAILWITH }
                { DUP ;
                  CAR ;
                  CDR ;
                  CONTRACT %transfer (pair (address %from) (address %to) (nat %value)) ;
                  IF_NONE { PUSH string "INVESTMENT_TOKEN_CONTRACT_NOT_FOUND" ; FAILWITH } {} ;
                  DUP 2 ;
                  CAR ;
                  CAR ;
                  DIG 2 ;
                  CDR ;
                  SELF_ADDRESS ;
                  PAIR 3 ;
                  SWAP ;
                  PUSH mutez 0 ;
                  DIG 2 ;
                  TRANSFER_TOKENS ;
                  SWAP ;
                  NIL operation ;
                  DIG 2 ;
                  CONS ;
                  PAIR } } } };
PAIR
    }|} : create_wallet_contract -> create_smart_wallet_result)]

let create_and_call_smart_wallet (p,s : create_and_call_smart_wallet_param * storage) : return = 
  let res = create_smart_wallet p.create_contract in
  let transfer_param : transfer_param_fa12 = {
    from = Tezos.get_self_address();
    to = res.addr;
    value = p.transfer.value;
  } in
  let transfer_op = Tezos.transaction transfer_param 0tez p.transfer.invst_tkn_contract in
  let new_wallet_map = Big_map.update (p.token_address,p.token_id) (Some res.addr : smart_wallet_address option) s.owner_wallet_map in 
([res.create_op; transfer_op], {s with owner_wallet_map = new_wallet_map})

let main (param, storage: parameter * storage) : return = 
  match param with 
  | WithdrawFa12 p -> withdraw_fa12 (p, storage)
  | BalanceOfQuery p -> balance_of_query (p, storage)
  | CreateAndCallSmartWallet p -> create_and_call_smart_wallet (p, storage)
  | BalanceOfResponse p -> balance_of_response (p, storage)
