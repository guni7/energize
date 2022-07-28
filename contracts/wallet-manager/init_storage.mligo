let init_storage : Storage.t = {
  owner_wallet_map = (Big_map.empty : (NftToken.token_address * NftToken.token_id, SmartWallet.sw_address) big_map);
  recent_balance_requests = (Big_map.empty : (address * nat, address) big_map); 
  withdraw_requests = (Big_map.empty : (address * nat, Storage.withdraw_fa12_param) big_map);
} in init_storage

