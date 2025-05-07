const axios = require('axios');

// Mapping from symbol to CoinGecko ID
const COINGECKO_IDS = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  MATIC: 'matic-network',
  USDT: 'tether',
  // Add more as needed
};

const getConversionRate = async (fromSymbol, toCurrency) => {
  const fromCurrencyId = COINGECKO_IDS[fromSymbol.toUpperCase()];
  const toCurrencyId = COINGECKO_IDS[toCurrency.toUpperCase()];

  if (!fromCurrencyId && fromSymbol.toUpperCase() !== 'USD') {
    throw new Error(`Unsupported fromCurrency symbol: ${fromSymbol}`);
  }

  // If fromCurrency is USD, fetch BTC to USD conversion
  if (fromSymbol.toUpperCase() === 'USD') {
    // Fetch from crypto to USD
    const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd`;
    try {
      const response = await axios.get(apiUrl);
      const btcToUsdRate = response.data['bitcoin'].usd;
      return 1 / btcToUsdRate;  // Invert the rate to get USD → BTC
    } catch (error) {
      console.error('Error fetching conversion rate for USD to BTC:', error.message);
      throw new Error('Unable to fetch USD to crypto conversion rate');
    }
  }

  // For normal conversion, fetch from crypto to crypto or crypto to fiat
  if (fromCurrencyId && toCurrencyId) {
    const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${fromCurrencyId}&vs_currencies=${toCurrencyId}`;
    try {
      const response = await axios.get(apiUrl);
      const rate = response.data[fromCurrencyId][toCurrencyId];
      if (!rate) {
        throw new Error(`Conversion rate not available for ${fromSymbol} to ${toCurrency}`);
      }
      return rate;
    } catch (error) {
      console.error('Error fetching conversion rate for crypto to crypto or fiat:', error.message);
      throw new Error('Unable to fetch conversion rate');
    }
  }

  throw new Error(`Unsupported conversion pair: ${fromSymbol} to ${toCurrency}`);
};

module.exports = { getConversionRate };
