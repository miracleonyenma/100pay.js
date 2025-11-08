/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
type CurrencyConversionPayload = Record<string, unknown> & {
  amount: number;
  from_symbol?: string;
  to_symbol?: string;
  appId?: string;
  mode?: string;

  // for backwards compatibility
  fromSymbol?: string;
  toSymbol?: string;
};

type EnhancedConversionResponse = {
  conversion: CurrencyConversionResult;
  adjustedConversion: {
    wasAdjusted: boolean;
    adjustedAmount: number;
    adjustedConvertedAmount: number;
    adjustedTotalCost: number;
    adjustedFeeInFromCurrency: number;
    adjustedFeeInToCurrency: number;
    reasonForAdjustment: string;
  };
  maximumConversion: {
    maxConvertibleAmount: number;
    maxConvertedAmount: number;
    maxTotalCost: number;
    maxFeeInFromCurrency: number;
    maxFeeInToCurrency: number;
    remainingBalance: number;
    canConvertEntireBalance: boolean;
  };
  balance: {
    currentBalance: number;
    availableBalance: number;
    hasSufficientBalance: boolean;
    shortfall: number;
    balanceAfterConversion: number;
  };
  wallets: {
    fromWallet: {
      exists: boolean;
      symbol: string;
      walletType: "fiat" | "crypto" | string;
    };
    toWallet: {
      exists: boolean;
      symbol: string;
      walletType: "fiat" | "crypto" | string;
    };
  };
  canProceed: boolean;
  recommendations: {
    useAdjustedAmount: boolean;
    convertEntireBalance: boolean;
    suggestedAmount: number;
    maxPossibleAmount: number;
  };
  restrictions: {
    isWhitelisted: boolean;
    validationPassed: boolean;
    additionalValidations: {
      [key: string]: {
        allowed: boolean;
        message: string;
      } | null;
    };
  };
  user: {
    status: string;
    canTransact: boolean;
  };
  mode: string;
  timestamp: string;
};

type CurrencyConversionResult = {
  convertedAmount: number;
  totalAmount: number;
  finalAmount: number;
  feeInUSD: number;
  feeInToCurrency: number;
  feeInFromCurrency: number;
  conversionFeeInUSD: number;
  conversionFeeInToCurrency: number;
  conversionFeeInFromCurrency: number;
  fromRate: number;
  toRate: number;
  intermediateUSDAmount: number;
  percentageConversionFee: number;
};

export {
  CurrencyConversionPayload,
  CurrencyConversionResult,
  EnhancedConversionResponse,
};
