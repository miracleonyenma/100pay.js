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
  /** Type of transfer - internal or external */
  transferType?: "internal" | "external";
  /** Optional note or memo for the transfer */
  note?: string;
  /** Optional Access Token for OAuth 2.0 authentication */
  oauthAccessToken?: string;
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
