const BAGS_API_URL = 'https://public-api-v2.bags.fm/api/v1'
const BAGS_API_KEY = process.env.BAGS_API_KEY!

export async function getBagsPools() {
  const response = await fetch(`${BAGS_API_URL}/solana/bags/pools`, {
    headers: { 'x-api-key': BAGS_API_KEY }
  })
  const data = await response.json()
  return data.response
}

export async function getPoolByTokenMint(tokenMint: string) {
  const response = await fetch(
    `${BAGS_API_URL}/solana/bags/pools/token-mint?tokenMint=${tokenMint}`,
    { headers: { 'x-api-key': BAGS_API_KEY } }
  )
  const data = await response.json()
  return data.response
}

export async function getTokenLifetimeFees(tokenMint: string) {
  const response = await fetch(
    `${BAGS_API_URL}/token-launch/lifetime-fees?tokenMint=${tokenMint}`,
    { headers: { 'x-api-key': BAGS_API_KEY } }
  )
  const data = await response.json()
  return data.response
}

export async function getTradeQuote(tokenMint: string) {
  const response = await fetch(
    `${BAGS_API_URL}/trade/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${tokenMint}&amount=1000000000`,
    { headers: { 'x-api-key': BAGS_API_KEY } }
  )
  const data = await response.json()
  return data.response
}

export async function getTokenClaimStats(tokenMint: string) {
  const response = await fetch(
    `${BAGS_API_URL}/token-launch/claim-stats?tokenMint=${tokenMint}`,
    { headers: { 'x-api-key': BAGS_API_KEY } }
  )
  const data = await response.json()
  return data.response
}