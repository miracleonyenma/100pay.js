// src/index.ts

import * as crypto from "crypto";
import {
  CreateSubAccountData,
  CreateSubAccountResponse,
} from "./types/subAccount";
import {
  CurrencyConversionPayload,
  CurrencyConversionResult,
  EnhancedConversionResponse,
  IBankListResponse,
  IBankTransferData,
  IBankTransferResponse,
  ISupportedWalletResponse,
  IVerifyBankData,
  IVerifyBankResponse,
  IVerifyResponse,
} from "./types";
import {
  ITransferAssetData,
  ITransferAssetResponse,
  ITransferHistoryParams,
  ITransferHistoryResponse,
  ITransferFeeParams,
  ITransferFeeResponse,
} from "./types/transfer";
import { IAppInfo, IOAuthApp, ITokenData, IUserInfo } from "./types/oauth";
import { logger } from "@untools/logger";

export interface IApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
  meta?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Configuration interface for initializing the Pay100 SDK
 * @property publicKey - API public key required for all API calls
 * @property secretKey - Secret key used for server-side authentication and request signing
 * @property baseUrl - Optional API base URL, defaults to production endpoint
 */
interface IPay100Config {
  publicKey: string;
  secretKey?: string;
  baseUrl?: string;
}

/**
 * Interface representing transaction data returned from payment verification
 * Flexible structure to accommodate various transaction types and properties
 */
export interface ITransactionData {
  [key: string]: unknown;
}

// Default API endpoint if not otherwise specified
const BASE_URL = process.env.BASE_URL || "https://api.100pay.co";

/**
 * Custom error class for payment verification failures
 * Provides consistent error structure for better error handling
 */
export class PaymentVerificationError extends Error {
  status: string;
  data: Record<string, never>;

  constructor(message: string) {
    super(message);
    this.name = "PaymentVerificationError";
    this.status = "error";
    this.data = {};
  }
}

/**
 * Main SDK class for interacting with the 100Pay payment platform
 * Provides methods for transaction verification, subaccount management,
 * currency conversion, and asset transfers
 */
export class Pay100 {
  private publicKey: string;
  private secretKey?: string;
  private baseUrl: string;

  /**
   * Initialize the Pay100 SDK
   * @param config - Configuration object containing API keys and optional base URL
   */
  constructor({ publicKey, secretKey, baseUrl = BASE_URL }: IPay100Config) {
    this.publicKey = publicKey;
    this.secretKey = secretKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Creates a cryptographic signature for secure server-to-server communication
   *
   * @param payload - Request payload that needs to be signed
   * @returns Object containing current timestamp and HMAC SHA-256 signature
   * @throws Error if secret key is missing or invalid
   */
  private createSignature(payload: Record<string, unknown>): {
    timestamp: string;
    signature: string;
  } {
    const timestamp = Date.now().toString();

    // Extract the token part from the secret key if it's in the format
    // STATUS;TYPE;TOKEN (e.g., "LIVE;SK;eyJhbGciOiJIUzI1...")
    let signingSecret = this?.secretKey;

    if (this?.secretKey?.includes(";")) {
      const secretKeyParts = this.secretKey.split(";");
      if (secretKeyParts.length === 3) {
        // Use just the token part as the signing secret
        signingSecret = secretKeyParts[2];
      }
    }

    if (!signingSecret) {
      throw new Error("Secret key is required for signing");
    }

    // Create signature using HMAC SHA-256
    const signature = crypto
      .createHmac("sha256", signingSecret)
      .update(timestamp + JSON.stringify(payload))
      .digest("hex");

    return { timestamp, signature };
  }

  /**
   * Constructs HTTP headers for API requests with optional authentication
   *
   * @param payload - Request payload used to generate security signature
   * @returns Object containing all necessary HTTP headers
   */
  private getHeaders(
    payload: Record<string, unknown> = {}
  ): Record<string, string> {
    // Generate authentication headers if secret key is available (server-side mode)
    if (this.secretKey) {
      const { timestamp, signature } = this.createSignature(payload);
      return {
        "api-key": this.publicKey,
        "x-secret-key": this.secretKey,
        "x-timestamp": timestamp,
        "x-signature": signature,
        "Content-Type": "application/json",
      };
    }

    // Basic headers for public API usage (client-side mode)
    return {
      "api-key": this.publicKey,
      "Content-Type": "application/json",
    };
  }

  /**
   * Verifies the status and details of a payment transaction
   *
   * @param transactionId - Unique identifier of the transaction to verify
   * @returns Promise resolving to verification result with transaction data
   * @throws PaymentVerificationError on network issues or invalid responses
   */
  verify = async (transactionId: string): Promise<IVerifyResponse> => {
    try {
      const payload = { transactionId };

      const response = await fetch(
        `${this.baseUrl}/api/v1/pay/crypto/payment/${transactionId}`,
        {
          method: "POST",
          headers: this.getHeaders(payload),
          body: JSON.stringify(payload),
        }
      );

      // Parse response data
      const responseData: unknown = await response.json().catch(() => null);

      // Handle empty response
      if (!responseData) {
        return {
          status: "error",
          data: null,
          message:
            "Something went wrong, be sure you supplied a valid payment id.",
        };
      }

      // Handle string responses which indicate errors
      if (typeof responseData === "string") {
        if (responseData === "Access Denied, Invalid KEY supplied") {
          return {
            status: "error",
            data: null,
            message: "Access Denied, Invalid KEY supplied",
          };
        }

        if (responseData === "invalid payment id supplied") {
          return {
            status: "error",
            data: null,
          };
        }
      }

      // Ensure the response data is an object that can be safely cast to ITransactionData
      const transactionData: IVerifyResponse["data"] =
        responseData && typeof responseData === "object"
          ? (responseData as unknown as IVerifyResponse["data"])
          : null;

      // Return successful response with properly typed data
      return {
        status: "success",
        data: transactionData,
      };
    } catch (error) {
      // Handle errors with appropriate message
      throw new PaymentVerificationError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  };

  /**
   * Namespace for subaccount management operations
   * Provides methods to create and manage subaccounts
   */
  subaccounts = {
    /**
     * Creates a new subaccount within the platform
     *
     * @param data - Subaccount configuration including owner details and supported currencies
     * @returns Promise resolving to the created subaccount details
     * @throws Error if the request fails or returns invalid data
     */
    create: async (
      data: CreateSubAccountData
    ): Promise<CreateSubAccountResponse> => {
      // Make sure the networks are lowercase
      data.networks = data.networks.map((network) => network.toLowerCase());
      return this.request<CreateSubAccountResponse>(
        "POST",
        "/api/v1/assets/subaccount/create",
        data
      );
    },
  };

  /**
   * Namespace for currency conversion operations
   * Provides methods to calculate exchange rates and fees
   */
  conversion = {
    /**
     * Calculates a preview of currency conversion with rates and fees
     *
     * @param data - Conversion details including amount, source and target currencies
     * @returns Promise resolving to detailed conversion calculation
     * @throws Error if the request fails or returns invalid data
     */
    preview: async (
      data: CurrencyConversionPayload
    ): Promise<CurrencyConversionResult | EnhancedConversionResponse> => {
      return this.request<
        CurrencyConversionResult | EnhancedConversionResponse
      >("POST", "/api/v1/user/preview-convert-asset", {
        ...data,
        ...(data.fromSymbol && {
          from_symbol: data.fromSymbol,
        }),
        ...(data.toSymbol && {
          to_symbol: data.toSymbol,
        }),
      });
    },
  };

  /**
   * Namespace for asset transfer operations
   * Provides methods to transfer assets, view history, and calculate fees
   */
  transfer = {
    /**
     * Transfer assets between wallets
     *
     * @param data - Transfer details including amount, currency, destination, and authentication
     * @returns Promise resolving to transfer confirmation with receipt and transaction ID
     * @throws Error if the transfer fails due to validation, insufficient funds, or other issues
     */
    executeTransfer: async (
      data: ITransferAssetData
    ): Promise<ITransferAssetResponse> => {
      const { oauthAccessToken, ...transferData } = data;
      return this.request<ITransferAssetResponse>(
        "POST",
        "/api/v1/transfer/asset",
        transferData,
        oauthAccessToken ? { Authorization: `Bearer ${oauthAccessToken}` } : {}
      );
    },

    /**
     * Get transfer history for the authenticated user
     *
     * @param params - Filtering and pagination parameters
     * @returns Promise resolving to paginated transfer history records
     * @throws Error if the request fails or authentication is invalid
     */
    getHistory: async (
      params: ITransferHistoryParams
    ): Promise<ITransferHistoryResponse> => {
      return this.request<ITransferHistoryResponse>(
        "GET",
        "/api/v1/transfer/history",
        params
      );
    },

    /**
     * Calculate transfer fees for a potential transaction
     *
     * @param params - Fee calculation parameters including currency and transfer type
     * @returns Promise resolving to detailed fee breakdown
     * @throws Error if the fee calculation fails or currency is not supported
     */
    calculateFee: async (
      params: ITransferFeeParams
    ): Promise<ITransferFeeResponse> => {
      return this.request<ITransferFeeResponse>(
        "GET",
        "/api/v1/transfer/fee",
        params
      );
    },
  };

  /**
   * Namespace for wallet operations
   * Provides methods to retrieve supported wallets
   */
  wallet = {
    /**
     * Get a list of supported wallets and their details
     *
     * @returns Promise resolving to an array of supported wallet configurations
     * @throws Error if the request fails or authentication is invalid
     */
    getSupportedWallets: async (): Promise<ISupportedWalletResponse> => {
      return this.request<ISupportedWalletResponse>(
        "GET",
        "/api/v1/wallet/supported"
      );
    },
  };

  /**
   * Namespace for bank transfer operations
   * Provides methods to transfer to external bank accounts
   */
  bankTransfer = {
    /**
     * Get Bank List
     * @returns Promise resolving to an array of supported banks
     * @throws Error if the request fails or authentication is invalid
     */
    getBankList: async (): Promise<IBankListResponse> => {
      return this.request<IBankListResponse>(
        "GET",
        "/api/v1/bank-transfers/banks"
      );
    },

    /**
     * Verify Bank
     * @param data - Bank details
     * @returns Promise resolving to bank details
     * @throws Error if the request fails or authentication is invalid
     */
    verifyBank: async (data: IVerifyBankData): Promise<IVerifyBankResponse> => {
      return this.request<IVerifyBankResponse>(
        "POST",
        "/api/v1/bank-transfers/verify-account",
        data
      );
    },

    /**
     * Perform a bank transfer
     * @param data - Bank transfer details
     * @returns Promise resolving to bank transfer details
     * @throws Error if the request fails or authentication is invalid
     */
    transfer: async (
      data: IBankTransferData
    ): Promise<IBankTransferResponse> => {
      return this.request<IBankTransferResponse>(
        "POST",
        "/api/v1/bank-transfers",
        data
      );
    },
  };

  /**
   * Namespace for OAuth 2.0 operations
   */
  oauth = {
    /**
     * Register a new OAuth application.
     * @param data - Application details.
     * @returns Promise resolving to the registered OAuth application details.
     */
    registerApp: async (data: {
      appName: string;
      appDescription: string;
      appLogo: string;
      redirectUris: string[];
      allowedScopes: string[];
    }): Promise<IOAuthApp> => {
      return this.request<IOAuthApp>("POST", "/api/v1/oauth/register", data);
    },

    /**
     * Get the authorization URL to redirect the user to.
     * @param params - Authorization parameters.
     * @returns Promise resolving to the authorization URL.
     */
    getAuthorizationUrl: async (params: {
      client_id: string;
      redirect_uri: string;
      scope?: string;
      state?: string;
    }): Promise<string> => {
      const response = await this.request<{
        data: { authorizationUrl: string };
      }>("GET", "/api/v1/oauth/authorize", params);
      return response.data.authorizationUrl;
    },

    /**
     * Exchange authorization code for an access token.
     * @param data - Code exchange details.
     * @returns Promise resolving to the token data.
     */
    exchangeCodeForToken: async (data: {
      grant_type: "authorization_code";
      code: string;
      client_id: string;
      client_secret: string;
      redirect_uri: string;
    }): Promise<IApiResponse<ITokenData>> => {
      return this.request<IApiResponse<ITokenData>>(
        "POST",
        "/api/v1/oauth/token",
        data
      );
    },

    /**
     * Get user information using the access token.
     * @param accessToken - The access token.
     * @returns Promise resolving to the user information.
     */
    getUserInfo: async (
      accessToken: string
    ): Promise<IApiResponse<IUserInfo>> => {
      return this.request<IApiResponse<IUserInfo>>(
        "GET",
        "/api/v1/oauth/userinfo",
        {},
        { Authorization: `Bearer ${accessToken}` }
      );
    },

    /**
     * Get application information using the access token.
     * @param accessToken - The access token.
     * @returns Promise resolving to the application information.
     */
    getAppInfo: async (
      accessToken: string
    ): Promise<IApiResponse<IAppInfo>> => {
      return this.request<IApiResponse<IAppInfo>>(
        "GET",
        "/api/v1/oauth/appinfo",
        {},
        { Authorization: `Bearer ${accessToken}` }
      );
    },

    /**
     * Revoke an access token.
     * @param token - The access token to revoke.
     * @returns Promise resolving when the token is revoked.
     */
    revokeToken: async (token: string): Promise<void> => {
      return this.request<void>("POST", "/api/v1/oauth/revoke", { token });
    },
  };

  /**
   * Generic method to make authenticated API requests to any endpoint
   *
   * @param method - HTTP method to use (GET, POST, PUT, DELETE)
   * @param endpoint - API endpoint path (will be appended to base URL)
   * @param data - Request payload or query parameters
   * @returns Promise resolving to the typed API response
   * @throws Error with detailed message on request failure
   */
  async request<T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    endpoint: string,
    data: Record<string, unknown> = {},
    customHeaders: Record<string, string> = {}
  ): Promise<T> {
    try {
      // Build URL with query parameters for GET requests
      const url =
        method === "GET" && Object.keys(data).length > 0
          ? `${this.baseUrl}${endpoint}?${new URLSearchParams(
              data as Record<string, string>
            )}`
          : `${this.baseUrl}${endpoint}`;

      const headers = this.getHeaders(data);
      const options = {
        method,
        headers: { ...headers, ...customHeaders },
        body: method !== "GET" ? JSON.stringify(data) : undefined,
      };
      logger?.debug(`Request to ${url}`, { options });
      const response = await fetch(url, options);

      // Handle response.ok check and throw errors for failed requests
      if (!response.ok) {
        const errorData: unknown = await response.json().catch(() => ({}));
        logger.error(errorData);
        const errorMessage = this.extractErrorMessage(errorData);
        throw new Error(`API Request Failed: ${errorMessage}`);
      }

      // Parse JSON response
      const responseData: unknown = await response.json();

      // Check if the response indicates an error despite a successful HTTP status
      if (
        responseData &&
        typeof responseData === "object" &&
        "success" in responseData
      ) {
        if ((responseData as { success?: boolean }).success === false) {
          // Extract error from the API's own error indication
          const errorMessage = this.extractErrorMessage(responseData);
          throw new Error(`API Request Failed: ${errorMessage}`);
        }
      }

      return responseData as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      // Handle unexpected error types
      throw new Error(`API Request Failed: ${String(error)}`);
    }
  }

  /**
   * Extracts error message from various response data structures
   *
   * @param data - The response data object which may contain error information
   * @returns The most specific error message available
   */
  private extractErrorMessage(data: unknown): string {
    // If data is a string, return it directly
    if (typeof data === "string") {
      return data;
    }

    // If data is not an object or is null, return a generic message
    if (typeof data !== "object" || data === null) {
      return "Unknown error";
    }

    // Handle different error structures
    const dataObj = data as Record<string, unknown>;

    // Direct error message in data.message
    if ("message" in dataObj && typeof dataObj.message === "string") {
      return dataObj.message;
    }

    // Error object with message property
    if ("error" in dataObj) {
      const error = dataObj.error;

      // String error
      if (typeof error === "string") {
        return error;
      }

      // Object error with message
      if (error && typeof error === "object") {
        const errorObj = error as Record<string, unknown>;

        if ("message" in errorObj && typeof errorObj.message === "string") {
          return errorObj.message;
        }

        // Try to get any useful information from the error object
        if ("code" in errorObj && typeof errorObj.code === "string") {
          return `Error code: ${errorObj.code}`;
        }
      }
    }

    // Look for error in the 'data' property
    if ("data" in dataObj && dataObj.data && typeof dataObj.data === "object") {
      const nestedData = dataObj.data as Record<string, unknown>;

      if ("message" in nestedData && typeof nestedData.message === "string") {
        return nestedData.message;
      }

      if (
        "error" in nestedData &&
        nestedData.error &&
        typeof nestedData.error === "object"
      ) {
        const nestedError = nestedData.error as Record<string, unknown>;
        if (
          "message" in nestedError &&
          typeof nestedError.message === "string"
        ) {
          return nestedError.message;
        }
      }
    }

    // If we have a statusText from the response, use that
    if ("statusText" in dataObj && typeof dataObj.statusText === "string") {
      return dataObj.statusText;
    }

    // Stringify the error if nothing else works
    try {
      return `Error details: ${JSON.stringify(dataObj)}`;
    } catch {
      return "Unknown error occurred";
    }
  }
}

export * from "./types";
export * from "./types/transfer";
export * from "./types/oauth";
