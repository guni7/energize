import { AvailableToken, TezosAccountAddress, TokenBalanceInfo } from "../types";

export const fetchUserBalances = async (address: TezosAccountAddress): Promise<TokenBalanceInfo[] | null> => {
    try {
        const tokensWithBalanceReq = await fetch(
            `https://api.tzkt.io/v1/tokens/balances?account=${address}&balance.gt=1`
        );
        let map : any = {
            2447 : AvailableToken.BTCtz,
            2489 : AvailableToken.FLAME,
            5716525 : AvailableToken.GIF
        } ;
        if (tokensWithBalanceReq) {
            const tokensWithBalance = await tokensWithBalanceReq.json();
            return tokensWithBalance.map((tokenData: any) => ({
                id: tokenData.id,
                address: tokenData.token.contract.address,
                balance: tokenData.balance,
                decimals: tokenData.token.metadata?.decimals ? tokenData.token.metadata?.decimals : 0,
                icon: tokenData.token.metadata?.icon ? tokenData.token.metadata?.icon : '',
                name: tokenData.token.metadata?.name ? tokenData.token.metadata?.name : map[tokenData.id],
                symbol: map[tokenData.id],
                type: tokenData.token.standard.toUpperCase(),
                isApproved: false
            }));
        } else {
            return null;
        }

    } catch(err) {
        console.log(err);
        return null;
    }
};