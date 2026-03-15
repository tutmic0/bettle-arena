const HELIUS_API_KEY = process.env.HELIUS_API_KEY!
const HELIUS_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`

export async function getTokenHolders(tokenMint: string) {
  const response = await fetch(HELIUS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getTokenAccounts',
      params: {
        mint: tokenMint,
        limit: 1000
      }
    })
  })
  const data = await response.json()
  return data.result
}

export async function getTokenTransactions(tokenMint: string) {
  const response = await fetch(
    `https://api.helius.xyz/v0/addresses/${tokenMint}/transactions?api-key=${HELIUS_API_KEY}&limit=100`,
    { method: 'GET' }
  )
  const data = await response.json()
  return data
}

export async function getTokenBalance(
  walletAddress: string,
  tokenMint: string
) {
  const response = await fetch(HELIUS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getTokenAccountsByOwner',
      params: [
        walletAddress,
        { mint: tokenMint },
        { encoding: 'jsonParsed' }
      ]
    })
  })
  const data = await response.json()
  const accounts = data.result?.value
  if (!accounts || accounts.length === 0) return 0
  return accounts[0].account.data.parsed.info.tokenAmount.uiAmount
}

export async function getTokenMetadata(tokenMint: string) {
  const response = await fetch(HELIUS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getAsset',
      params: { id: tokenMint }
    })
  })
  const data = await response.json()
  const result = data.result
  if (!result) return null
  return {
    name: result.content?.metadata?.name || tokenMint.slice(0, 6),
    symbol: result.content?.metadata?.symbol || tokenMint.slice(0, 4).toUpperCase(),
    image: result.content?.links?.image || result.content?.files?.[0]?.uri || null,
  }
}