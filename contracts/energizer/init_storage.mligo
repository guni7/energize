let init_storage : storage = {
  wallet_manager_map = (Big_map.empty : (invst_token_id, wallet_manager_address) big_map);
  tokens = (Big_map.empty: (invst_token_id, invst_token_details) big_map);
  admin = ("tz1XsBudQn7Xvn1msvmgDDNqBKeqRh5atuVW" : address);
} in init_storage

