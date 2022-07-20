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
  token_address: asset_address;
  token_id : token_id
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

type parameter = 
  Energize of energize_param
  | WithdrawFa12 of withdraw_fa12_param

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
      ([create_wallet_and_call_tr; transfer_to_mgr_tr], s) 
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
  let wallet_mgr_contract : withdraw_fa12_mgr_param contract = match (Tezos.get_entrypoint_opt "%withdraw_fa12" wallet_manager : withdraw_fa12_mgr_param contract option) with 
    | None -> (failwith "WALLET_MANAGER_CONTRACT_NOT_FOUND")
    | Some ctr -> ctr in 
  let withdraw_fa12_mgr_param : withdraw_fa12_mgr_param = {
    token_address = p.token_address;
    token_id = p.token_id;
    receiver_address = p.receiver_address;
    invst_token_address = p.invst_token_address;
    amount = p.amount;
    withdrawer = Tezos.get_sender();
  } in 
  let tr : operation = Tezos.transaction withdraw_fa12_mgr_param 0tez wallet_mgr_contract in
  ([tr], s)

let main (param, storage : parameter * storage) : return = 
  match param with
  | Energize p -> energize (p, storage)
  | WithdrawFa12 p -> withdraw_fa12 (p, storage)
