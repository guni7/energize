type asset_address = address
type wallet_manager_address = address
type smart_wallet_address = address
type invst_token_address = address

type invst_token_id = nat
type token_id = nat 

type token_type = string

type invst_token_details = {
  token_address : invst_token_address;
  token_type : token_type;
  decimals : nat;
}

type get_balance = address * (nat contract)

type storage = {
  wallet_manager_map : (invst_token_id, wallet_manager_address) big_map; 
  tokens : (invst_token_id, invst_token_details) big_map;
  admin : address;
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
  invst_token_address : invst_token_address;
  amount : nat ;
}

type energize_with_interest_param = {
  token_address : asset_address ;
  token_id : token_id;
  invst_token_id : invst_token_id;
  amount : nat ;
}
type get_wallet_address_param = {
  token_address: asset_address;
  token_id : token_id
}
type balance_of_request = [@layout:comb]{
  owner : address;
  token_id : nat;
}
  
type balance_of_query_param = {
  requests : balance_of_request list;
  token_address : address;
}

type withdraw_fa12_param = {
  token_address : asset_address;
  token_id : token_id;
  receiver_address : address;
  invst_token_address : invst_token_address;
  invst_token_id : invst_token_id; (* remove this  *)
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
type token_details = {
  invst_token_address : address;
  balance : nat;
  decimals : nat;
}
type smart_wallet_contract_storage = {
  wallet_manager : wallet_manager_address;
  nft_address : asset_address * token_id;
  token_balances_fa12 : (invst_token_address, token_details) map;
}

type create_wallet_contract = 
  [@layout:comb]
  (* order matters because we will cross the Michelson boundary *)
  { delegate : key_hash option;
    balance : tez;
    storage : smart_wallet_contract_storage
  }

type transfer_details = {
  invst_tkn_contract : transfer_param_fa12 contract;
  value : nat;
}

type create_and_call_smart_wallet_param = {
  create_contract : create_wallet_contract;
  transfer : transfer_details;
  token_address : asset_address;
  token_id : token_id;
}

type add_wallet_manager_param = {
  invst_token_id : invst_token_id;
  invst_token_details : invst_token_details;
  wallet_manager : wallet_manager_address;
}
type parameter = 
  Energize of energize_param
  | WithdrawFa12 of withdraw_fa12_param
  | AddWalletManager of add_wallet_manager_param
type return = operation list * storage


let energize (p, s : energize_param * storage) : return = 
  (* validation here*)
  let wallet_manager : wallet_manager_address = match (Big_map.find_opt p.invst_token_id s.wallet_manager_map) with
    | None -> (failwith "WALLET_MANAGER_NOT_FOUND" : wallet_manager_address) 
    | Some addr -> addr in

  (*collect $$$*)
  let invst_tkn_deets : invst_token_details = match (Big_map.find_opt p.invst_token_id s.tokens) with 
  | None -> (failwith "INVESTMENT_TOKEN_NOT_FOUND" : invst_token_details)
  | Some d -> d in
  let invst_tkn_contract : transfer_param_fa12 contract = match (Tezos.get_entrypoint_opt ("%transfer") (invst_tkn_deets.token_address) : transfer_param_fa12 contract option) with
  | None -> (failwith "INVESTMENT_TOKEN_CONTRACT_NOT_FOUND" :transfer_param_fa12 contract )
  | Some ctr -> ctr in
  let self_transfer_param : transfer_param_fa12 = {
    from = Tezos.get_sender();
    to = Tezos.get_self_address();
    value = p.amount; (* add fees here*)
  } in
  let transfer_to_self_txn : operation = Tezos.transaction self_transfer_param 0tez invst_tkn_contract in

  (*transfer funds to smart wallet *)
  (* get wallet id *) 
  let wallet_key : get_wallet_address_param = {
    token_address = p.token_address; 
    token_id = p.token_id;
  } in
  let return : return = match (Tezos.call_view "get_wallet_address" wallet_key wallet_manager : address option) with
    | None -> 
      let smart_wallet_init_storage : smart_wallet_contract_storage = {
        wallet_manager = wallet_manager;
        nft_address = (p.token_address, p.token_id);
        token_balances_fa12 = (Map.empty: (invst_token_address, token_details) map);
      } in
      let create_wallet_contract : create_wallet_contract = {
        delegate = (None : key_hash option) ;
        balance = 0tez;
        storage = smart_wallet_init_storage; 
      } in 
      let transfer_details : transfer_details = {
        invst_tkn_contract = invst_tkn_contract ;
        value = p.amount;
      } in
      let create_and_call_smart_wallet_param : create_and_call_smart_wallet_param = {
        create_contract = create_wallet_contract;
        transfer = transfer_details;
        token_address = p.token_address ;
        token_id = p.token_id;
      } in
      let create_and_call_contract_entrypoint : create_and_call_smart_wallet_param contract = 
        match (Tezos.get_entrypoint_opt ("%createAndCallSmartWallet") wallet_manager: create_and_call_smart_wallet_param contract option) with 
        | None -> (failwith "CREATE_SMART_WALLET_ENTRYPOINT_NOT_FOUND" : create_and_call_smart_wallet_param contract)
        | Some ep -> ep in
      let create_wallet_and_call_tr : operation = 
        Tezos.transaction create_and_call_smart_wallet_param 0tez create_and_call_contract_entrypoint in
      (*transfer to wallet manager *)
      let mgr_transfer_param : transfer_param_fa12 = {
        from = Tezos.get_sender();
        to = (wallet_manager : address);
        value = p.amount; 
      } in
      let transfer_to_mgr_tr : operation = Tezos.transaction mgr_transfer_param 0tez invst_tkn_contract in
      ([transfer_to_mgr_tr; create_wallet_and_call_tr], s) 
    | Some addr -> 
        let wallet_transfer_param : transfer_param_fa12 = {
          from = Tezos.get_sender();
          to = (addr: address);
          value = p.amount; 
        } in
        let transfer_to_wallet_txn : operation = Tezos.transaction wallet_transfer_param 0tez invst_tkn_contract in
        ([transfer_to_self_txn; transfer_to_wallet_txn],s)
    in return


let withdraw_fa12 (p,s : withdraw_fa12_param * storage) : return = 
  (*send withdraw request to wallet manager*)
  let wallet_manager : wallet_manager_address = match (Big_map.find_opt p.invst_token_id s.wallet_manager_map) with
    | None -> (failwith "WALLET_MANAGER_NOT_FOUND" : wallet_manager_address) 
    | Some addr -> addr in
  let wallet_mgr_contract : withdraw_fa12_mgr_param contract = match (Tezos.get_entrypoint_opt "%withdrawFa12" wallet_manager : withdraw_fa12_mgr_param contract option) with 
    | None -> (failwith "WALLET_MANAGER_WITHDRAW_ENTRYPOINT_NOT_FOUND")
    | Some ctr -> ctr in 
  let withdraw_fa12_mgr_param : withdraw_fa12_mgr_param = {
    token_address = p.token_address;
    token_id = p.token_id;
    receiver_address = p.receiver_address;
    invst_token_address = p.invst_token_address;
    amount = p.amount;
    withdrawer = Tezos.get_sender();
  } in 
  let withdr_tr : operation = Tezos.transaction withdraw_fa12_mgr_param 0tez wallet_mgr_contract in

  let bal_of_ep : balance_of_query_param contract = match (Tezos.get_entrypoint_opt "%balanceOfQuery" wallet_manager : balance_of_query_param contract option) with 
    | None -> (failwith "WALLET_MANAGER_BALANCE_OF_ENTRYPOINT_NOT_FOUND" : balance_of_query_param contract)
    | Some ctr -> ctr in 

  let balance_of_query_requests : balance_of_request list = [{
    owner = Tezos.get_sender();
    token_id = (p.token_id : nat);
  };] in 
  let balance_of_query : balance_of_query_param = {
    requests = balance_of_query_requests;
    token_address = (p.token_address : address) ;
  } in
  let bal_of_tr : operation = Tezos.transaction balance_of_query 0tez bal_of_ep in 
  ([bal_of_tr; withdr_tr;], s)


let add_wallet_manager (p, s : add_wallet_manager_param * storage) : return = 
  if Tezos.get_sender() <> s.admin then failwith "ONLY_ADMIN_ALLOWED" else
  let new_tokens = Big_map.update (p.invst_token_id) (Some p.invst_token_details : invst_token_details option) s.tokens in
  let new_wallet_mgr_map = Big_map.update (p.invst_token_id) (Some p.wallet_manager : wallet_manager_address option) s.wallet_manager_map in
  ([], {s with tokens = new_tokens; wallet_manager_map = new_wallet_mgr_map})


let main (param, storage : parameter * storage) : return = 
  match param with
  | Energize p -> energize (p, storage)
  | WithdrawFa12 p -> withdraw_fa12 (p, storage)
  | AddWalletManager p -> add_wallet_manager (p, storage)
