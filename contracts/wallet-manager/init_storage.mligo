let init_storage : storage = {
  owner_wallet_map = (Big_map.empty : (token_address * token_id, smart_wallet_address) big_map);
  recent_balance_requests = (Big_map.empty : (address * nat, address) big_map); 
  withdraw_requests = (Big_map.empty : (address * nat, withdraw_fa12_param) big_map);
} in init_storage

