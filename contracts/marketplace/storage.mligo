type storage = {
  ledger : ledger;
  market_place : market_place;
  operators : (operator, unit) big_map;
  metadata : (string, bytes) big_map;
  token_metadata : (token_id, token_info) big_map;
  total_tokens : nat;
  admin : address;
  next_token_id : nat;
}