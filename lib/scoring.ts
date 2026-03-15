import { getTokenHolders, getTokenTransactions } from './helius'
import { getTradeQuote } from './bags'

const WEIGHTS = {
  uniqueWallets: 0.30,
  buySellRatio: 0.25,
  pricePerformance: 0.20,
  transactionCount: 0.15,
  holderRetention: 0.10
}

const MIN_TRANSACTION_USD = 20

export async function calculateCoinScore(
  tokenMint: string,
  startPrice: number
): Promise<{
  uniqueWallets: number
  buySellRatio: number
  pricePerformance: number
  transactionCount: number
  holderRetention: number
  totalScore: number
}> {
  const [holders, transactions, quote] = await Promise.all([
    getTokenHolders(tokenMint),
    getTokenTransactions(tokenMint),
    getTradeQuote(tokenMint)
  ])

  // Unique wallets
  const uniqueWallets = holders?.total || 0

  // Filter transactions ispod $20
  const validTxs = transactions?.filter((tx: any) => {
    return tx.nativeTransfers?.some(
      (t: any) => t.amount / 1e9 * 200 >= MIN_TRANSACTION_USD
    )
  }) || []

  // Buy/Sell ratio
  const buys = validTxs.filter((tx: any) => tx.type === 'SWAP').length
  const sells = validTxs.filter((tx: any) => tx.type === 'TRANSFER').length
  const buySellRatio = sells === 0 ? buys : buys / (buys + sells)

  // Price performance
  const currentPrice = quote?.price || startPrice
  const pricePerformance = startPrice > 0
    ? (currentPrice - startPrice) / startPrice
    : 0

  // Transaction count
  const transactionCount = validTxs.length

  // Holder retention (simplifikovano — % holdera koji nisu prodali)
  const holderRetention = uniqueWallets > 0
    ? Math.min(1, (uniqueWallets - sells) / uniqueWallets)
    : 0

  // Total score (normalized 0-100)
  const totalScore = (
    (Math.min(uniqueWallets, 1000) / 1000) * WEIGHTS.uniqueWallets +
    buySellRatio * WEIGHTS.buySellRatio +
    Math.min(Math.max(pricePerformance + 1, 0), 2) / 2 * WEIGHTS.pricePerformance +
    (Math.min(transactionCount, 500) / 500) * WEIGHTS.transactionCount +
    holderRetention * WEIGHTS.holderRetention
  ) * 100

  return {
    uniqueWallets,
    buySellRatio,
    pricePerformance,
    transactionCount,
    holderRetention,
    totalScore
  }
}

export function determineWinner(
  scoreA: number,
  scoreB: number
): 'a' | 'b' {
  return scoreA >= scoreB ? 'a' : 'b'
}

export function calculatePoints(round: 1 | 2 | 3 | 4): number {
  const pointsMap = { 1: 1, 2: 2, 3: 3, 4: 5 }
  return pointsMap[round]
}