
let balance_of (p, s: balance_of_param * storage): operation list * storage =
  // creates the list of all requested balances
  let list_of_balances: balance_of_callback_param list =
    List.map
      (
        fun (req: balance_of_request): balance_of_callback_param ->
          if not Big_map.mem req.token_id s.token_metadata
            then (failwith "FA2_TOKEN_UNDEFINED": balance_of_callback_param)
            else
              match Big_map.find_opt (req.owner, req.token_id) s.ledger with
              | None -> { request = { owner = req.owner; token_id = req.token_id }; balance = 0n }
              | Some b -> { request = { owner = req.owner; token_id = req.token_id }; balance = b }
      )
      p.requests in
      // forges operation for callback and returns storage
      [Tezos.transaction list_of_balances 0tez p.callback], s

let apply_transfer (((from, s), transfer): (address * storage) * transfer_to): address * storage =
  let { to_ = recipient; token_id = token_id; amount = amt } = transfer in
  if not Big_map.mem token_id s.token_metadata
  then (failwith "FA2_TOKEN_UNDEFINED": address * storage)
  else
    let sender_balance: nat =
      match Big_map.find_opt (from, token_id) s.ledger with
      | None -> 0n
      | Some b -> b in
    if sender_balance < amt
    then (failwith "FA2_INSUFFICIENT_BALANCE": address * storage)
    else
      let operator = { owner = from; operator = Tezos.get_sender(); token_id = token_id } in
      if Tezos.get_sender() <> from && not Big_map.mem operator s.operators
      then (failwith "FA2_NOT_OPERATOR": address * storage)
      else
        let new_ledger: ledger = 
          Big_map.update (from, token_id) (Some (abs (sender_balance - amt))) s.ledger in
        let new_ledger: ledger =
          match Big_map.find_opt (recipient, token_id) new_ledger with
          | None -> Big_map.add (recipient, token_id) amt new_ledger
          | Some blnc -> Big_map.update (recipient, token_id) (Some (blnc + amt)) new_ledger
          in
          from, { s with ledger = new_ledger }

let process_transfer (s, transfer: storage * transfer_param): storage =
  let { from_ = from; txs = txs } = transfer in
  let (_, new_storage): address * storage = 
    List.fold apply_transfer txs (from, s)
  in new_storage

let transfer (transfer_list, s: (transfer_param list) * storage): storage =
  if Tezos.get_amount() > 0tez
  then (failwith "NO_XTZ_AMOUNT": storage)
  else List.fold process_transfer transfer_list s

let update_operators (operators_list, s: (update_operators_param list) * storage): storage =
  List.fold
    (
      fun ((s, operator_param): storage * update_operators_param) ->
        match operator_param with
        | Add_operator operator ->
            if Tezos.get_sender() <> operator.owner
            then (failwith "FA2_NOT_OWNER": storage)
            else
              { s with operators = Big_map.add operator unit s.operators }
        | Remove_operator operator->
          if Tezos.get_sender() <> operator.owner
          then (failwith "FA2_NOT_OWNER": storage)
          else
            { s with operators = Big_map.remove operator s.operators }
    )
    operators_list
    s

let mint (p, s: mint_param * storage): storage =
  let { token_amount = token_amount; ipfs_hash = ipfs_hash } = p in
    // token_metadata must be a valid IPFS hash
    if String.length ipfs_hash <> 46n || String.sub 0n 1n ipfs_hash <> "Q"
    then (failwith "INVALID_IPFS_HASH": storage)
    else
      // mints the new NFTs
      let new_ledger = Big_map.add (Tezos.get_sender(), s.next_token_id) token_amount s.ledger in
      let token_info = 
        { token_id = s.next_token_id; token_info = Map.literal [ ("", Bytes.pack ("ipfs://" ^ ipfs_hash)) ] } in
      let new_token_metadata = Big_map.add s.next_token_id token_info s.token_metadata in
      {
        s with
          ledger = new_ledger;
          token_metadata = new_token_metadata;
          next_token_id = s.next_token_id + 1n;
          total_tokens = s.total_tokens + token_amount;
      }
  
let burn (p, s: burn_param * storage): storage =
  let { token_id = token_id; token_amount = token_amount } = p in
  if not Big_map.mem token_id s.token_metadata
  then (failwith "FA2_TOKEN_UNDEFINED": storage)
  else
    // user must own the required amount of tokens
    match Big_map.find_opt (Tezos.get_sender(), token_id) s.ledger with
    | None -> (failwith "FA2_INSUFFICIENT_BALANCE": storage)
    | Some blnc -> 
      // checks if balance is enough
      if blnc < token_amount
      then (failwith "FA2_INSUFFICIENT_BALANCE": storage)
      else
        let new_balance = abs (blnc - token_amount) in
        let new_ledger = Big_map.update (Tezos.get_sender(), token_id) (Some new_balance) s.ledger in
        // cleans up token_metadata bigmap if new_balance = 0n
        let new_token_metadata =
          if new_balance = 0n
          then Big_map.remove token_id s.token_metadata
          else s.token_metadata
        in
        {
          s with
            ledger = new_ledger;
            token_metadata = new_token_metadata;
            total_tokens = abs (s.total_tokens - token_amount);
        }