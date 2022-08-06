let init_storage : storage = {
  ledger = (Big_map.empty : ledger);
  market_place = (Big_map.empty :market_place);
  operators = (Big_map.empty : (operator, unit) big_map);
  metadata = (Big_map.empty: (string, bytes) big_map);
  token_metadata = (Big_map.empty: (token_id, token_info) big_map);
  total_tokens = 0n;
  admin = ("tz1XsBudQn7Xvn1msvmgDDNqBKeqRh5atuVW" : address);
  next_token_id = 1n;
} in
init_storage


