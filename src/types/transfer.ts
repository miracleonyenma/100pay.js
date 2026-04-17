// src/types/transfer.ts

export interface IWalletTransaction {
  _id: string;
  accountId: string;
  subAccountId: string;
  appId: string;
  userId: string;
  symbol: string;
  from: string;
  to: string;
  type: "credit" | "debit"; // can be narrowed to 'credit' | 'debit' if strictly used that way
  description: string;
  failureReason: string;
  transactionHash?: string | null;
  transactionSignature: string;
  status?: string; // default is "pending", but allow string if not restricted
  amount: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Input data for transferring assets between wallets
 */
export interface ITransferAssetData extends Record<string, unknown> {
  /** Amount to transfer (must be greater than zero) */
  amount: number | string;
  /** Asset symbol/currency code to transfer */
  symbol: string;
  /** Destination address or account identifier */
  to: string;
  /** Source wallet address (used for external transfers) */
  from?: string;
  /** Type of transfer - internal or external */
  transferType?: "internal" | "external";
  /** Optional note or memo for the transfer */
  note?: string;
  /** Optional Access Token for OAuth 2.0 authentication */
  oauthAccessToken?: string;
  /**
   * Enable multi-wallet waterfall mode.
   * When true, balances from multiple wallets are combined to meet the transfer amount.
   */
  multiWallet?: boolean;
  /**
   * Priority order for wallet debiting in multi-wallet mode.
   * Wallets listed first are debited before later ones.
   * @example ["NGN", "USDC", "PAY"]
   */
  walletOrder?: string[];
  /**
   * Wallets to include in the multi-wallet balance pool.
   * Defaults to all withdrawable wallets when omitted.
   * @example ["NGN", "USDC", "PAY"]
   */
  wallets?: string[];
  /**
   * Minimum balance to preserve per wallet (floor amounts).
   * Balances below these thresholds will not be used to fund the transfer.
   * @example { "NGN": 100, "USDC": 5 }
   */
  minBalances?: Record<string, number>;
}

/**
 * Breakdown of a single wallet's contribution in a multi-wallet transfer
 */
export interface IWithdrawalPlanEntry {
  /** Wallet source currency symbol */
  symbol: string;
  /** Wallet identifier */
  walletId: string;
  /** Amount debited in the wallet's native currency */
  amountInWalletCurrency: number;
  /** Amount equivalent in the requested transfer currency */
  amountInRequestedCurrency: number;
  /** Conversion rate applied (1.0 for same-currency legs) */
  conversionRate: number;
}

/**
 * Analysis result of a multi-wallet waterfall withdrawal
 */
export interface IWithdrawalAnalysis {
  /** Whether combined balances are sufficient to cover the transfer */
  sufficientFunds: boolean;
  /** Total available balance across all wallets (in requested currency) */
  totalAvailable: number;
  /** The requested transfer amount */
  requestedAmount: number;
  /** Currency of the transfer */
  requestedCurrency: string;
  /** Ordered list of per-wallet debit instructions */
  withdrawalPlan: IWithdrawalPlanEntry[];
}

/**
 * Response data for a successful transfer operation
 */
export interface ITransferAssetResponse {
  /** Status code of the response */
  statusCode: number;
  /** Success message */
  message: string;
  /** Transfer details and receipt */
  data: {
    /** Transaction receipt/confirmation */
    receipt: string;
    /** Unique transaction identifier */
    transactionId: string;
    /** Timestamp of when the transaction was processed */
    timestamp: string | number;
    /** Present when multiWallet mode was used */
    multiWallet?: true;
    /** Waterfall analysis detail — only present for multi-wallet transfers */
    withdrawalAnalysis?: IWithdrawalAnalysis;
  };
}

/**
 * Parameters for retrieving transfer history
 */
export interface ITransferHistoryParams extends Record<string, unknown> {
  /** Optional identifier for the wallet to filter transfers */
  accountIds?: string[];
  /** Optional account address to filter transfers */
  addresses?: string[];
  /** Optional currency symbol to filter transfers */
  symbols?: string[];
  /** Page number for pagination */
  page?: number;
  /** Number of records per page */
  limit?: number;
  /** Optional transfer type filter */
  type?: string;
}

/**
 * Individual transfer history item
 */
export interface ITransferHistoryItem extends IWalletTransaction {
  /** note for the transfer, if any */
  note?: string;
}

/**
 * Response data for transfer history query
 */
export interface ITransferHistoryResponse {
  /** Status code of the response */
  statusCode: number;
  /** Success message */
  message: string;
  /** List of transfer records */
  data: ITransferHistoryItem[];
  /** Pagination metadata */
  meta: {
    /** Total number of records available */
    total: number;
    /** Current page number */
    page: number;
    /** Records per page */
    limit: number;
    /** Total number of pages */
    pages: number;
    /** Has next page */
    hasNextPage: boolean;
    /** Has previous page */
    hasPreviousPage: boolean;
  };
}

/**
 * Parameters for calculating transfer fees
 */
export interface ITransferFeeParams extends Record<string, unknown> {
  /** Currency symbol to calculate fees for */
  symbol: string;
  /** Type of transfer - internal or external */
  transferType?: "internal" | "external";
}

/**
 * Response data for fee calculation
 */
export interface ITransferFeeResponse {
  /** Status code of the response */
  statusCode: number;
  /** Success message */
  message: string;
  /** Fee details */
  data: {
    /** Base fee amount */
    baseFee: string | number;
    /** Network fee (for blockchain transfers) */
    networkFee?: string | number;
    /** Total fee to be paid */
    totalFee: string | number;
    /** Currency symbol of the fee */
    feeSymbol: string;
    /** Current network congestion level (if applicable) */
    networkCongestion?: "low" | "medium" | "high";
  };
}
