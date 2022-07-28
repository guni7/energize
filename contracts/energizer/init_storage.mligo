let init_storage = {
  wm_map = (Big_map.empty : (InvestmentToken.token_id, WalletManager.wm_address) big_map);
  invst_tokens = (Big_map.empty: (InvestmentToken.token_id, InvestmentToken.token_details) big_map);
  admin = ("tz1XsBudQn7Xvn1msvmgDDNqBKeqRh5atuVW" : address);
} in init_storage

