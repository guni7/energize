let init_storage : storage = {
  owner_wallet_map = (Big_map.empty : (token_address * token_id, smart_wallet_address) big_map);
  latest_owner_balance = 0n;
} in init_storage

