# 100Pay SDK

A TypeScript library for integrating with the 100Pay payment platform, enabling developers to easily accept cryptocurrency payments, manage transactions, and perform bank transfers.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [Initialization](#initialization)
  - [Transaction Verification](#transaction-verification)
  - [Subaccounts](#subaccounts)
  - [Currency Conversion](#currency-conversion)
  - [Asset Transfers](#asset-transfers)
    - [Multi-Wallet Waterfall Transfers](#multi-wallet-waterfall-transfers)
  - [Wallet Operations](#wallet-operations)
  - [Bank Transfers](#bank-transfers)
  - [OAuth 2.0 Authorization](#oauth-20-authorization)
  - [Generic API Requests](#generic-api-requests)
- [Error Handling](#error-handling)
- [Security and Authentication](#security-and-authentication)
- [TypeScript Support](#typescript-support)
- [Common Use Cases](#common-use-cases)
  - [Accepting Cryptocurrency Payments](#accepting-cryptocurrency-payments)
  - [Creating Subaccounts for Partners or Marketplaces](#creating-subaccounts-for-partners-or-marketplaces)
  - [Currency Conversion Preview](#currency-conversion-preview)
  - [Multi-Wallet Waterfall Transfer](#multi-wallet-waterfall-transfer)
  - [Bank Transfer Workflow](#bank-transfer-workflow)
  - [OAuth 2.0 Workflow](#oauth-20-workflow)
- [Webhook Handling](#webhook-handling)
- [Resources](#resources)
- [Development](#development)
  - [Building from Source](#building-from-source)
  - [Available Scripts](#available-scripts)
- [License](#license)

## Features

- ✅ Verify cryptocurrency payments
- ✅ Create and manage subaccounts
- ✅ Preview currency conversions
- ✅ Transfer assets between wallets
- ✅ Multi-wallet waterfall transfers (combine balances across currencies)
- ✅ Get supported wallets
- ✅ Bank transfers with account verification
- ✅ OAuth 2.0 for secure authorization
- ✅ Make authenticated API requests
- ✅ Full TypeScript support with comprehensive typing
- ✅ Secure server-to-server communication with request signing

## Installation

```bash
npm install @100pay-hq/100pay.js
```

Or using yarn:

```bash
yarn add @100pay-hq/100pay.js
```

## Quick Start

```typescript
import { Pay100 } from "@100pay-hq/100pay.js";

// Initialize the 100Pay client
const client = new Pay100({
  publicKey: "your_public_key",
  secretKey: "your_secret_key", // Required for server-side operations
});

// Verify a transaction
async function verifyTransaction(transactionId) {
  try {
    const result = await client.verify(transactionId);

    if (result.status === "success") {
      console.log("Transaction verified:", result.data);
      return result.data;
    } else {
      console.error("Verification failed:", result.message);
      return null;
    }
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
}
```

## API Reference

### Initialization

```typescript
const client = new Pay100({
  publicKey: string, // Your 100Pay public API key (required)
  secretKey: string, // Your 100Pay secret API key (required for server-side operations)
  baseUrl: string, // Optional custom API base URL (defaults to https://api.100pay.co)
});
```

### Transaction Verification

```typescript
// Verify a crypto payment transaction
const result = await client.verify(transactionId);
```

**Parameters:**

| Parameter     | Type   | Description                                |
| ------------- | ------ | ------------------------------------------ |
| transactionId | string | The unique ID of the transaction to verify |

**Returns:**

```typescript
interface IVerifyResponse {
  status: "success" | "error";
  data?: ITransactionData | null;
  message?: string;
}
```

**Example:**

```typescript
try {
  const result = await client.verify("tx_123456789");

  if (result.status === "success") {
    // Payment is valid
    const { amount, currency, status } = result.data;
    // Process order fulfillment
  } else {
    // Payment verification failed
    console.error(result.message);
  }
} catch (error) {
  // Handle verification error
  if (error instanceof PaymentVerificationError) {
    console.error(`Payment verification failed: ${error.message}`);
  }
}
```

### Subaccounts

Subaccounts allow you to create and manage separate accounts under your main account.

> **Important:** The `networks` array must contain lowercase network names (e.g., `"ethereum"`, `"bsc"`, `"polygon"`, `"tron"`, `"sol"`, `"bitcoin"`).

```typescript
// Create a subaccount
const subaccount = await client.subaccounts.create({
  symbols: ["BTC", "ETH", "USDT"],
  networks: ["ethereum", "bsc"],
  owner: {
    name: "Partner Store",
    email: "partner@example.com",
    phone: "+1234567890",
  },
  metadata: {
    storeId: "store-123",
    region: "US",
  },
});
```

**Parameters:**

```typescript
interface CreateSubAccountData {
  symbols: string[]; // List of supported cryptocurrencies
  networks: string[]; // List of supported blockchain networks (must be lowercase)
  owner: {
    name: string; // Owner's name
    email: string; // Owner's email
    phone: string; // Owner's phone number
  };
  metadata: Record<string, unknown>; // Custom metadata for the subaccount
}
```

**Returns:**

```typescript
interface CreateSubAccountResponse {
  message: string;
  accounts: Account[];
}

interface Account {
  balance: {
    available: number | null;
    locked: number | null;
  };
  accountType: string; // e.g. "subaccount"
  walletType: string; // e.g. "crypto"
  status: string; // e.g. "active"
  _id: string;
  name: string; // e.g. "Tether USDT"
  symbol: string; // e.g. "USDT"
  decimals: string; // e.g. "18"
  account: AccountDetails;
  contractAddress: string;
  logo: string;
  userId: string;
  appId: string;
  network: string;
  ownerId: string;
  parentWallet: string;
  __v: number;
}

interface AccountDetails {
  address: string;
  key: Key;
  network: string;
}

interface Key {
  version: number;
  id: string;
  address: string;
  crypto: Crypto;
}

interface Crypto {
  ciphertext: string;
  cipherparams: {
    iv: string;
  };
  cipher: string;
  kdf: string;
  kdfparams: {
    dklen: number;
    salt: string;
    n: number;
    r: number;
    p: number;
  };
  mac: string;
}
```

**Example:**

```typescript
try {
  const result = await client.subaccounts.create({
    symbols: ["USDT", "BTC"],
    networks: ["ethereum"],
    owner: {
      name: "Merchant Store",
      email: "merchant@example.com",
      phone: "+1234567890",
    },
    metadata: {
      businessType: "ecommerce",
    },
  });

  console.log(`Created ${result.accounts.length} accounts for the subaccount`);
  // Store wallet addresses for each account
  result.accounts.forEach((account) => {
    console.log(`${account.symbol} wallet: ${account.account.address}`);
  });
} catch (error) {
  console.error(`Failed to create subaccount: ${error.message}`);
}
```

### Currency Conversion

Preview currency conversion rates and fees:

```typescript
// Preview a currency conversion
const conversion = await client.conversion.preview({
  amount: 100,
  from_symbol: "BTC",
  to_symbol: "USDT",
  appId: "your_app_id", // Optional
});
```

**Parameters:**

```typescript
interface CurrencyConversionPayload {
  amount: number; // Amount to convert
  from_symbol?: string; // Source currency symbol (snake_case)
  to_symbol?: string; // Target currency symbol (snake_case)
  fromSymbol?: string; // Source currency symbol (camelCase) - for backward compatibility
  toSymbol?: string; // Target currency symbol (camelCase) - for backward compatibility
  appId?: string; // Optional application ID
  mode?: string; // Optional conversion mode
}
```

> **Note:** You can use either `from_symbol`/`to_symbol` (snake_case) or `fromSymbol`/`toSymbol` (camelCase). The SDK supports both formats for backward compatibility.

**Returns:**

The preview may return a simple result or an enhanced response with more details:

```typescript
// Simple result
interface CurrencyConversionResult {
  convertedAmount: number;              // Final amount after conversion
  totalAmount: number;                  // Total amount including fees
  finalAmount: number;                  // Final amount after all deductions
  feeInUSD: number;                     // Fee amount in USD
  feeInToCurrency: number;              // Fee amount in target currency
  feeInFromCurrency: number;            // Fee amount in source currency
  conversionFeeInUSD: number;           // Conversion fee in USD
  conversionFeeInToCurrency: number;    // Conversion fee in target currency
  conversionFeeInFromCurrency: number;  // Conversion fee in source currency
  fromRate: number;                     // Exchange rate for source currency
  toRate: number;                       // Exchange rate for target currency
  intermediateUSDAmount: number;        // Intermediate amount in USD
  percentageConversionFee: number;      // Percentage conversion fee
}

// Enhanced response (see types for full structure)
type EnhancedConversionResponse = { ... }
```

**Example:**

```typescript
try {
  const preview = await client.conversion.preview({
    amount: 0.5,
    from_symbol: "BTC",
    to_symbol: "USDT",
  });

  if ("convertedAmount" in preview) {
    console.log(`You will receive: ${preview.convertedAmount} USDT`);
    console.log(
      `Exchange rate: 1 BTC = ${preview.toRate / preview.fromRate} USDT`,
    );
    console.log(
      `Total fees: ${preview.feeInUSD} USD (${preview.feeInFromCurrency} BTC)`,
    );
  } else {
    // Handle enhanced response
    console.log("Enhanced conversion preview:", preview);
  }
} catch (error) {
  console.error(`Conversion preview failed: ${error.message}`);
}
```

### Asset Transfers

Transfer assets between wallets and manage transfer operations:

```typescript
// Standard single-wallet transfer
const transfer = await client.transfer.executeTransfer({
  amount: 100,
  symbol: "USDT",
  to: "0x1234567890abcdef...",
  transferType: "external",
  note: "Payment for services",
  oauthAccessToken: "your_oauth_token", // Optional: for OAuth 2.0 authentication
});

// Multi-wallet waterfall transfer
// Combines balances from multiple wallets to meet the requested amount
const multiTransfer = await client.transfer.executeTransfer({
  amount: 10,
  symbol: "NGN",
  to: "297080",
  from: "625988",
  transferType: "internal",
  note: "Payment for services",
  multiWallet: true,
  walletOrder: ["USDC", "NGN"], // Debit USDC first, then NGN
  wallets: ["USDC", "NGN"],     // Wallets to draw from
  minBalances: { NGN: 100 },    // Keep at least 100 NGN in the NGN wallet
});

// Get transfer history
const history = await client.transfer.getHistory({
  page: 1,
  limit: 10,
  symbols: ["USDT"], // Optional filter by symbols
  type: "credit", // Optional filter: "credit" or "debit"
  accountIds: ["account_123"], // Optional filter by account IDs
  addresses: ["0x..."], // Optional filter by addresses
});

// Calculate transfer fees
const fees = await client.transfer.calculateFee({
  symbol: "USDT",
  transferType: "external",
});
```

**Transfer Parameters:**

```typescript
interface ITransferAssetData {
  amount: number | string;              // Amount to transfer (must be greater than zero)
  symbol: string;                       // Target asset symbol/currency code
  to: string;                           // Destination address, payid, or referral code
  from?: string;                        // Source wallet address (for external transfers)
  transferType?: "internal" | "external"; // Type of transfer (default: "external")
  note?: string;                        // Optional note or memo
  oauthAccessToken?: string;            // Optional OAuth 2.0 access token

  // ── Multi-wallet waterfall options ──────────────────────────────────────
  multiWallet?: boolean;                // Enable waterfall mode (default: false)
  walletOrder?: string[];               // Priority order for debiting wallets
  wallets?: string[];                   // Wallet pool to draw from (defaults to all withdrawable wallets)
  minBalances?: Record<string, number>; // Floor balances to preserve per wallet
}
```

> **Multi-wallet mode** debits wallets in the order specified by `walletOrder`, automatically converting non-primary currency balances to the target `symbol` as needed. If `walletOrder` is omitted the target currency wallet is tried first.

#### Multi-Wallet Waterfall Transfers

**Transfer Response:**

```typescript
interface ITransferAssetResponse {
  statusCode: number;
  message: string;
  data: {
    receipt: string;             // Transaction receipt/confirmation
    transactionId: string;       // Unique transaction identifier
    timestamp: string | number;  // Transaction timestamp
    multiWallet?: true;          // Present when multi-wallet mode was used
    withdrawalAnalysis?: {       // Only present for multi-wallet transfers
      sufficientFunds: boolean;
      totalAvailable: number;    // Total available in requested currency
      requestedAmount: number;
      requestedCurrency: string;
      withdrawalPlan: Array<{
        symbol: string;                   // Source wallet currency
        walletId: string;
        amountInWalletCurrency: number;   // Amount debited in source currency
        amountInRequestedCurrency: number; // Equivalent in target currency
        conversionRate: number;
      }>;
    };
  };
}
```

**History Parameters:**

```typescript
interface ITransferHistoryParams {
  accountIds?: string[]; // Filter by account IDs
  addresses?: string[]; // Filter by addresses
  symbols?: string[]; // Filter by currency symbols
  page?: number; // Page number for pagination
  limit?: number; // Records per page
  type?: string; // Filter by type: "credit" or "debit"
}
```

**History Response:**

```typescript
interface ITransferHistoryResponse {
  statusCode: number;
  message: string;
  data: ITransferHistoryItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface ITransferHistoryItem {
  _id: string;
  accountId: string;
  subAccountId: string;
  appId: string;
  userId: string;
  symbol: string;
  from: string;
  to: string;
  type: "credit" | "debit";
  description: string;
  failureReason: string;
  transactionHash?: string | null;
  transactionSignature: string;
  status?: string;
  amount: string;
  note?: string; // Optional note attached to the transfer
  createdAt?: Date;
  updatedAt?: Date;
}
```

**Fee Response:**

```typescript
interface ITransferFeeResponse {
  statusCode: number;
  message: string;
  data: {
    baseFee: string | number; // Base fee amount
    networkFee?: string | number; // Network fee (for blockchain transfers)
    totalFee: string | number; // Total fee to be paid
    feeSymbol: string; // Currency symbol of the fee
    networkCongestion?: "low" | "medium" | "high"; // Current network congestion level
  };
}
```

### Wallet Operations

Get information about supported wallets:

```typescript
// Get supported wallets
const wallets = await client.wallet.getSupportedWallets();
console.log(`Supported wallets:`, wallets);
```

### Bank Transfers

The SDK supports bank transfer operations including getting bank lists, verifying accounts, and executing transfers:

```typescript
// Get list of supported banks
const bankList = await client.bankTransfer.getBankList();
console.log(`${bankList.data.count} banks available`);

// Verify a bank account
const verification = await client.bankTransfer.verifyBank({
  bankCode: "044",
  accountNumber: "1234567890",
});

if (verification.data.verified) {
  console.log(`Account verified: ${verification.data.accountName}`);

  // Execute bank transfer
  const transfer = await client.bankTransfer.transfer({
    beneficiaryBankCode: "044",
    beneficiaryAccountNumber: "1234567890",
    beneficiaryAccountName: "John Doe",
    amount: 50000, // Amount in Naira (₦50,000)
    narration: "Payment for services",
    paymentReference: `ref_${Date.now()}`,
    saveBeneficiary: true,
  });

  console.log(`Transfer initiated: ${transfer.data.transfer.sessionId}`);
}
```

**Bank Transfer Methods:**

#### Get Bank List

```typescript
const banks = await client.bankTransfer.getBankList();
```

**Returns:**

```typescript
interface IBankListResponse {
  statusCode: number;
  message: string;
  data: {
    banks: IBank[];
    count: number;
  };
}

interface IBank {
  name?: string;
  alias?: string[];
  routingKey?: string;
  logoImage?: string | null;
  bankCode?: string;
  categoryId?: string;
  nubanCode?: string | null;
}
```

#### Verify Bank Account

```typescript
const verification = await client.bankTransfer.verifyBank({
  bankCode: "044",
  accountNumber: "1234567890",
});
```

**Parameters:**

```typescript
interface IVerifyBankData {
  bankCode: string; // Bank code from the bank list
  accountNumber: string; // Account number to verify
}
```

**Returns:**

```typescript
interface IVerifyBankResponse {
  statusCode: number;
  message: string;
  data: {
    accountName: string;
    accountNumber: string;
    bankCode: string;
    bankName: string;
    verified: boolean;
  };
}
```

#### Execute Bank Transfer

```typescript
const transfer = await client.bankTransfer.transfer({
  beneficiaryBankCode: "044",
  beneficiaryAccountNumber: "1234567890",
  beneficiaryAccountName: "John Doe",
  amount: 50000, // Amount in Nigerian Naira (NGN)
  narration: "Payment description",
  paymentReference: "unique_ref_123",
  saveBeneficiary: true,
});
```

**Parameters:**

```typescript
interface IBankTransferData {
  beneficiaryBankCode: string; // Recipient's bank code
  beneficiaryAccountNumber: string; // Recipient's account number
  beneficiaryAccountName: string; // Recipient's account name
  amount: number; // Amount in Nigerian Naira (NGN)
  narration: string; // Transfer description
  paymentReference: string; // Unique payment reference
  saveBeneficiary: boolean; // Whether to save this beneficiary
}
```

**Returns:**

```typescript
interface IBankTransferResponse {
  statusCode: number;
  message: string;
  data: {
    transfer: {
      sessionId: string;
      status: string;
      amount: number;
      beneficiaryAccountNumber: string;
      beneficiaryBankCode: string;
      paymentReference: string;
      narration: string;
      createdAt: string;
    };
  };
}
```

### OAuth 2.0 Authorization

The SDK provides comprehensive OAuth 2.0 methods for secure authorization:

#### Register an OAuth Application

```typescript
// Register a new OAuth application
const app = await client.oauth.registerApp({
  appName: "My Application",
  appDescription: "Description of my app",
  appLogo: "https://example.com/logo.png",
  redirectUris: ["https://myapp.com/callback"],
  allowedScopes: ["read_user_info", "read_app_info"],
});

console.log(`Client ID: ${app.clientId}`);
console.log(`Client Secret: ${app.clientSecret}`);
```

#### Get Authorization URL

```typescript
const authUrl = await client.oauth.getAuthorizationUrl({
  client_id: "your_client_id",
  redirect_uri: "https://yourapp.com/callback",
  scope: "read_user_info read_app_info",
  state: "some_random_state",
});
```

#### Exchange Code for Access Token

```typescript
const tokenResponse = await client.oauth.exchangeCodeForToken({
  grant_type: "authorization_code",
  code: "authorization_code",
  client_id: "your_client_id",
  client_secret: "your_client_secret",
  redirect_uri: "https://yourapp.com/callback",
});
const tokenData = tokenResponse.data;
```

#### Get User Info

```typescript
const userInfoResponse = await client.oauth.getUserInfo(tokenData.access_token);
const userInfo = userInfoResponse.data;
```

#### Get App Info

```typescript
const appInfoResponse = await client.oauth.getAppInfo(tokenData.access_token);
const appInfo = appInfoResponse.data;
```

#### Revoke Token

```typescript
await client.oauth.revokeToken(tokenData.access_token);
console.log("Token revoked successfully");
```

**OAuth Types:**

```typescript
interface IOAuthApp {
  clientId: string;
  clientSecret: string;
  appName: string;
  redirectUris: string[];
  allowedScopes: string[];
}

interface ITokenData {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface IUserInfo {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  country: string;
  avatar: string;
  email: string;
  isEmailVerified: boolean;
  phone: string;
  verified: boolean;
}

interface IAppInfo {
  id: string;
  app_name: string;
  business_name: string;
  country: string;
  status: string;
  support_email: string;
}
```

### Generic API Requests

The SDK provides a generic `request` method for making any API call to the 100Pay API:

```typescript
const response = await client.request<ResponseType>(
  method, // 'GET', 'POST', 'PUT', or 'DELETE'
  endpoint, // API endpoint path
  data, // Request payload or query parameters
  customHeaders, // Optional: custom headers (e.g., Authorization)
);
```

**Example:**

```typescript
// Get user app balance with custom headers
const balance = await client.request<BalanceResponse>(
  "GET",
  "/api/v1/user-apps/:appId/wallet-balance/:symbol",
  {},
  { Authorization: `Bearer ${accessToken}` },
);
```

## Error Handling

The SDK provides typed error handling:

```typescript
try {
  const result = await client.verify(transactionId);
  // Process result
} catch (error) {
  if (error instanceof PaymentVerificationError) {
    // Handle payment verification specific error
    console.error(`Payment verification failed: ${error.message}`);
  } else if (error instanceof Error) {
    // Handle general error
    console.error(`API error: ${error.message}`);
  }
}
```

## Security and Authentication

This SDK implements secure authentication with 100Pay using API keys and request signing for server-to-server communications:

1. Each request is signed with HMAC SHA-256 using your secret key
2. Signatures include a timestamp to prevent replay attacks
3. All requests include your public API key for identification

Client-side operations can use public key only, while server-side operations require both public and secret keys.

## TypeScript Support

This package is built with TypeScript and includes full type definitions. The main types are exported for your convenience:

```typescript
import {
  Pay100,
  PaymentVerificationError,
  ITransactionData,
  IVerifyResponse,
  CreateSubAccountData,
  CreateSubAccountResponse,
  CurrencyConversionPayload,
  CurrencyConversionResult,
  EnhancedConversionResponse,
  Account,
  AccountDetails,
  ITransferAssetData,
  ITransferAssetResponse,
  ITransferHistoryParams,
  ITransferHistoryResponse,
  ITransferHistoryItem,
  ITransferFeeParams,
  ITransferFeeResponse,
  ISupportedWalletResponse,
  IBankListResponse,
  IBankTransferData,
  IBankTransferResponse,
  IVerifyBankData,
  IVerifyBankResponse,
  IOAuthApp,
  ITokenData,
  IUserInfo,
  IAppInfo,
} from "@100pay-hq/100pay.js";
```

## Common Use Cases

### Accepting Cryptocurrency Payments

1. Initialize the SDK with your API keys
2. When a payment is received, use the `verify` method to confirm the transaction
3. Process the order or service based on the verification result

### Creating Subaccounts for Partners or Marketplaces

```typescript
const subaccount = await client.subaccounts.create({
  symbols: ["BTC", "ETH", "USDT"],
  networks: ["ethereum"],
  owner: {
    name: "Partner Name",
    email: "partner@example.com",
    phone: "+1234567890",
  },
  metadata: {
    partnerId: "partner-123",
  },
});

// Save the subaccount information for future use
console.log(`Created subaccount with ${subaccount.accounts.length} wallets`);
subaccount.accounts.forEach((account) => {
  console.log(`${account.symbol} wallet: ${account.account.address}`);
});
```

### Currency Conversion Preview

```typescript
// Get conversion rates before executing a trade
const preview = await client.conversion.preview({
  amount: 1000,
  from_symbol: "USDT",
  to_symbol: "BTC",
});

// Show user the conversion details
if ("convertedAmount" in preview) {
  console.log(`You will receive approximately ${preview.convertedAmount} BTC`);
  console.log(
    `Exchange rate: 1 USDT = ${preview.toRate / preview.fromRate} BTC`,
  );
  console.log(
    `Fee: ${preview.feeInFromCurrency} USDT (${preview.feeInUSD} USD)`,
  );
} else {
  // Handle enhanced response
  console.log("Enhanced conversion preview:", preview);
}
```

### Multi-Wallet Waterfall Transfer

When a single wallet may not have sufficient balance, enable `multiWallet` mode to automatically combine balances from multiple wallets:

```typescript
// Scenario: user has 5 USDC and 200 NGN, and needs to send 10 NGN.
// Use USDC first (converted), top up with NGN if needed.
const result = await client.transfer.executeTransfer({
  amount: 10,
  symbol: "NGN",
  to: "recipient-payid",
  from: "sender-payid",
  transferType: "internal",
  multiWallet: true,
  walletOrder: ["USDC", "NGN"], // Prefer USDC; fall back to NGN
  wallets: ["USDC", "NGN"],
  minBalances: { NGN: 100 },    // Never dip below 100 NGN
});

if (result.data.multiWallet) {
  const { withdrawalPlan, totalAvailable } = result.data.withdrawalAnalysis!;
  console.log(`Funded from ${withdrawalPlan.length} wallet(s):`);
  withdrawalPlan.forEach((entry) => {
    console.log(
      `  ${entry.symbol}: ${entry.amountInWalletCurrency} → ${entry.amountInRequestedCurrency} NGN (rate: ${entry.conversionRate})`
    );
  });
}
```

**How it works:**

1. Balances from the listed `wallets` are fetched and any `minBalances` floors are subtracted.
2. Remaining balances are converted to the target `symbol` using live exchange rates.
3. Wallets are debited in `walletOrder` priority until the requested `amount` is covered.
4. Cross-currency legs are recorded as conversion transactions before the final transfer.

### Bank Transfer Workflow

```typescript
// Complete bank transfer workflow
async function performBankTransfer() {
  try {
    // 1. Get available banks
    const banks = await client.bankTransfer.getBankList();
    console.log(`Available banks: ${banks.data.count}`);

    // 2. Find the desired bank
    const targetBank = banks.data.banks.find((bank) =>
      bank.name?.includes("Access"),
    );
    if (!targetBank) throw new Error("Bank not found");

    // 3. Verify the recipient's account
    const verification = await client.bankTransfer.verifyBank({
      bankCode: targetBank.bankCode!,
      accountNumber: "1234567890",
    });

    if (!verification.data.verified) {
      throw new Error("Account verification failed");
    }

    console.log(`Account verified: ${verification.data.accountName}`);

    // 4. Execute the transfer
    const transfer = await client.bankTransfer.transfer({
      beneficiaryBankCode: targetBank.bankCode!,
      beneficiaryAccountNumber: "1234567890",
      beneficiaryAccountName: verification.data.accountName,
      amount: 50000, // ₦50,000 in Nigerian Naira
      narration: "Payment for services rendered",
      paymentReference: `PAY_${Date.now()}`,
      saveBeneficiary: true,
    });

    console.log(`Transfer successful: ${transfer.data.transfer.sessionId}`);
    return transfer.data.transfer;
  } catch (error) {
    console.error(`Bank transfer failed: ${error.message}`);
    throw error;
  }
}
```

### OAuth 2.0 Workflow

```typescript
// Complete OAuth 2.0 workflow
async function performOAuth() {
  try {
    // 1. Register OAuth application (one-time setup)
    const app = await client.oauth.registerApp({
      appName: "My Application",
      appDescription: "My app description",
      appLogo: "https://example.com/logo.png",
      redirectUris: ["https://myapp.com/callback"],
      allowedScopes: ["read_user_info", "read_app_info"],
    });

    // 2. Get authorization URL
    const authUrl = await client.oauth.getAuthorizationUrl({
      client_id: app.clientId,
      redirect_uri: "https://myapp.com/callback",
      scope: "read_user_info read_app_info",
      state: "some_random_state",
    });
    console.log(`Authorization URL: ${authUrl}`);

    // 3. Exchange code for access token (after user authorizes)
    const tokenResponse = await client.oauth.exchangeCodeForToken({
      grant_type: "authorization_code",
      code: "authorization_code_from_callback",
      client_id: app.clientId,
      client_secret: app.clientSecret,
      redirect_uri: "https://myapp.com/callback",
    });

    // 4. Get user info
    const userInfoResponse = await client.oauth.getUserInfo(
      tokenResponse.data.access_token,
    );
    console.log(`User info:`, userInfoResponse.data);

    // 5. Get app info
    const appInfoResponse = await client.oauth.getAppInfo(
      tokenResponse.data.access_token,
    );
    console.log(`App info:`, appInfoResponse.data);

    // 6. Revoke token when done
    await client.oauth.revokeToken(tokenResponse.data.access_token);
    console.log("Token revoked successfully");
  } catch (error) {
    console.error(`OAuth workflow failed: ${error.message}`);
    throw error;
  }
}
```

## Webhook Handling

100Pay sends webhooks for various events. Webhook payloads can be categorized into `bank_transfer`, `charge`, and `internal_transfer` events. Below are the type definitions and **real payload examples** for each event type, highlighting the **`type`**, **`eventType`**, and **`transferType`** fields where available.

### Setting Up a Webhook Handler

```typescript
import express from "express";

const app = express();
app.use(express.json());

app.post("/webhooks/100pay", (req, res) => {
  const payload = req.body;

  // Route the event based on eventType or type
  if (payload.eventType === "bank_transfer.debit") {
    handleBankTransferWithdrawal(payload);
  } else if (payload.eventType === "wallet.deposit.internal") {
    handleInternalDeposit(payload);
  } else if (payload.eventType === "transaction.withdrawal") {
    handleInternalWithdrawal(payload);
  } else if (payload.type === "credit" && payload.chargeId) {
    handlePaymentCharge(payload);
  }

  res.sendStatus(200);
});
```

---

### 1. Bank Transfer Withdrawal

Triggered when an outgoing bank transfer is initiated from your account to an external bank.

**Type Definition:**

```typescript
interface BankTransferWithdrawalWebhook {
  eventType: "bank_transfer.debit"; // 👈 Identifies the event
  transactionId: string;
  reference: string;
  amount: number;
  timestamp: string;
  transaction: {
    transactionHash: string;
    status: "successful" | "pending" | "failed";
    amount: string;
    category: string;
    _id: string;
    transactionSignature: string;
    type: "debit"; // 👈 Transaction direction
    accountId: string;
    appId: string;
    from: string;
    symbol: string;
    to: string;
  };
  data: {
    type: "Outwards"; // 👈 Indicates an outgoing transfer
    sessionId: string;
    paymentReference: string;
    provider: string;
    providerChannel: string;
    destinationInstitutionCode: string;
    creditAccountName: string;
    creditAccountNumber: string;
    debitAccountName: string;
    amount: number;
    fees: number;
    vat: number;
    stampDuty: number;
    status: "Created" | "Processing" | "Successful" | "Failed";
    narration: string;
  };
}
```

**Example Payload:**

```json
{
  "eventType": "bank_transfer.debit",
  "transactionId": "abc123def456ghi789jkl012",
  "reference": "TXF-1700000000000-ab12-cd34",
  "amount": 50,
  "timestamp": "2026-03-12T14:45:46.995Z",
  "transaction": {
    "transactionHash": "090000000000000000000000000000",
    "status": "successful",
    "amount": "50",
    "category": "uncategorized",
    "_id": "abc123def456ghi789jkl012",
    "transactionSignature": "pre-1700000000000-xxxxxxxxx-debit-JOHN DOE / 0123456789-My Business",
    "type": "debit",
    "accountId": "acc_0000000000000000000000",
    "appId": "app_0000000000000000000000",
    "from": "My Business",
    "symbol": "NGN",
    "to": "JOHN DOE / 0123456789"
  },
  "data": {
    "type": "Outwards",
    "sessionId": "090000000000000000000000000000",
    "paymentReference": "TXF-1700000000000-ab12-cd34",
    "provider": "NIBSS",
    "providerChannel": "NIP",
    "providerChannelCode": "2",
    "destinationInstitutionCode": "100004",
    "creditAccountName": "JOHN DOE",
    "creditAccountNumber": "0123456789",
    "debitAccountName": "ACME TECHNOLOGIES LIMITED / CURRENT",
    "narration": "Payment for consulting services",
    "amount": 50,
    "fees": 10,
    "vat": 0.75,
    "stampDuty": 0,
    "status": "Created"
  }
}
```

**Handler Example:**

```typescript
function handleBankTransferWithdrawal(payload: BankTransferWithdrawalWebhook) {
  const { reference, amount, transaction, data } = payload;

  console.log(`Bank transfer initiated`);
  console.log(`Reference: ${reference}`);
  console.log(
    `Amount: ₦${amount} → ${data.creditAccountName} (${data.creditAccountNumber})`,
  );
  console.log(`Status: ${transaction.status}`);
  console.log(`Session ID: ${data.sessionId}`);

  // Update your database, notify your user, etc.
}
```

---

### 2. Payment Charge (Bank Transfer or Crypto)

Triggered when a payment charge is confirmed — covers both bank transfer top-ups and crypto payments.

**Type Definition:**

```typescript
interface PaymentChargeWebhook {
  type: "credit"; // 👈 Charge direction
  _id: string;
  chargeId: string;
  reference: string;
  data: {
    from: string;
    to: string;
    transaction_id: string;
    status: "CONFIRMED" | "PENDING" | "FAILED";
    timestamp: string;
    value: {
      local: { amount: string; currency: string };
      crypto: { amount: number; currency: string };
    };
    metadata?: {
      sessionId?: string;
      provider?: string;
      originalAmount?: number;
      fees?: number;
      sessionCurrency?: string;
    };
    charge: {
      customer: { user_id: string; name: string; email: string; phone: string };
      billing: {
        currency: string;
        amount: string;
        description: string;
        pricing_type: string;
      };
      status: {
        value: "paid" | "pending" | "failed";
        total_paid: number;
      };
      ref_id: string;
      payments: PaymentRecord[];
      charge_source: string;
      call_back_url: string;
      app_id: string;
    };
  };
  appId: string;
  cryptoChargeId: string;
  createdAt: string;
}
```

**Example Payload — Bank Transfer Top-up:**

```json
{
  "type": "credit",
  "_id": "charge_event_0000000000000000",
  "chargeId": "charge_0000000000000000",
  "reference": "AbCdEfGhIjKlMnOp",
  "data": {
    "from": "0123456789",
    "to": "9876543210",
    "transaction_id": "100000000000000000000000000000",
    "status": "CONFIRMED",
    "timestamp": "2026-03-12T14:40:29.987Z",
    "value": {
      "local": { "amount": "50.00", "currency": "NGN" },
      "crypto": { "amount": 50, "currency": "NGN" }
    },
    "metadata": {
      "sessionId": "VIR_SESSION_0000000000000_XXXXXXXX",
      "provider": "safehaven",
      "originalAmount": 55,
      "fees": 5,
      "sessionCurrency": "NGN"
    },
    "charge": {
      "customer": {
        "user_id": "1",
        "name": "Jane Smith",
        "email": "jane.smith@example.com",
        "phone": "08000000000"
      },
      "billing": {
        "currency": "NGN",
        "vat": 0,
        "pricing_type": "fixed_price",
        "amount": "50",
        "description": "Funding my account",
        "country": "NG"
      },
      "status": {
        "context": { "status": "paid", "value": 50 },
        "value": "paid",
        "total_paid": 50
      },
      "ref_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "charge_source": "external",
      "call_back_url": "https://yourapp.com/verify-order/",
      "app_id": "app_0000000000000000000000"
    }
  },
  "appId": "app_0000000000000000000000",
  "cryptoChargeId": "crypto_charge_0000000000000000",
  "createdAt": "2026-03-12T14:40:29.998Z"
}
```

**Handler Example:**

```typescript
function handlePaymentCharge(payload: PaymentChargeWebhook) {
  const { reference, data } = payload;
  const { charge, value, status } = data;

  if (status !== "CONFIRMED") {
    console.warn(`Charge ${reference} not yet confirmed. Status: ${status}`);
    return;
  }

  console.log(`Payment confirmed for ${charge.customer.email}`);
  console.log(`Amount: ${value.local.currency} ${value.local.amount}`);
  console.log(`Charge status: ${charge.status.value}`);
  console.log(`Total paid: ${charge.status.total_paid}`);

  // Fulfill the order, credit the user's account, etc.
}
```

---

### 3. Internal Transfer Withdrawal

Triggered when funds are sent from your wallet to another internal 100Pay wallet.

**Type Definition:**

```typescript
interface InternalTransferWithdrawalWebhook {
  eventType: "transaction.withdrawal"; // 👈 Identifies the event
  eventId: string;
  timestamp: string;
  transactionId: string;
  transactionHash: string;
  amount: string;
  currency: string;
  type: "debit"; // 👈 Transaction direction
  status: "successful" | "pending" | "failed";
  description: string;
  from: string;
  to: string;
  category: "internal_transfer";
  metadata: {
    transferType: "internal"; // 👈 Confirms internal transfer
    recipientWalletId: string;
    recipientUserId: string;
    note?: string;
    exchangeRates?: ExchangeRate[];
  };
}
```

**Example Payload:**

```json
{
  "eventType": "transaction.withdrawal",
  "eventId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "timestamp": "2026-03-12T13:42:46.165Z",
  "transactionId": "txn_0000000000000000000000",
  "transactionHash": "DR_0000000000000_XXXXXXXX",
  "amount": "100",
  "currency": "NGN",
  "type": "debit",
  "status": "successful",
  "description": "Internal transfer to 160005",
  "from": "625988",
  "to": "160005",
  "category": "internal_transfer",
  "metadata": {
    "recipientWalletId": "wallet_0000000000000000000000",
    "recipientUserId": "user_0000000000000000000000",
    "recipientWallet": {
      "balance": { "available": 0, "locked": 0 },
      "accountType": "mainaccount",
      "walletType": "local",
      "status": "active",
      "name": "NGN",
      "symbol": "NGN"
    },
    "transferType": "internal",
    "note": "PAYXXXXXXXX",
    "exchangeRates": [
      {
        "symbol": "USDT",
        "price": 1.0002,
        "margin": 0,
        "last_updated": "2026-03-12T13:40:01.107Z"
      },
      {
        "symbol": "NGN",
        "price": 0.00073,
        "margin": 0,
        "last_updated": "2026-03-12T13:40:01.982Z"
      }
    ]
  }
}
```

**Handler Example:**

```typescript
function handleInternalWithdrawal(payload: InternalTransferWithdrawalWebhook) {
  const { transactionId, amount, currency, from, to, status, metadata } =
    payload;

  console.log(`Internal withdrawal processed`);
  console.log(`Transaction ID: ${transactionId}`);
  console.log(`Amount: ${currency} ${amount} from wallet ${from} → ${to}`);
  console.log(`Status: ${status}`);

  if (metadata.note) {
    console.log(`Note: ${metadata.note}`);
  }

  // Log or update your records accordingly
}
```

---

### 4. Internal Transfer Deposit

Triggered when funds arrive in your wallet from another internal 100Pay wallet.

**Type Definition:**

```typescript
interface InternalTransferDepositWebhook {
  eventType: "wallet.deposit.internal"; // 👈 Identifies the event
  transactionHash: string;
  status: "successful" | "pending" | "failed";
  amount: string;
  category: string;
  _id: string;
  transactionSignature: string;
  from: string;
  symbol: string;
  to: string;
  type: "credit"; // 👈 Transaction direction
  transferType: "internal"; // 👈 Confirms internal transfer
  note?: string;
  network?: string;
  timestamp: string;
  accountId: string;
  appId: string;
  userId: string;
}
```

**Example Payload:**

```json
{
  "eventType": "wallet.deposit.internal",
  "transactionHash": "internal-transfer-txn_0000000000000000000000",
  "status": "successful",
  "amount": "500",
  "category": "uncategorized",
  "_id": "txn_0000000000000000000000",
  "transactionSignature": "internal-transfer-txn_0000000000000000000000-credit-625988-916698",
  "from": "916698",
  "symbol": "NGN",
  "to": "625988",
  "type": "credit",
  "transferType": "internal",
  "note": "Hello there!",
  "network": "bsc",
  "timestamp": "2026-03-12T13:32:35.200Z",
  "accountId": "acc_0000000000000000000000",
  "appId": "app_0000000000000000000000",
  "userId": "user_0000000000000000000000"
}
```

**Handler Example:**

```typescript
function handleInternalDeposit(payload: InternalTransferDepositWebhook) {
  const { amount, symbol, from, to, status, note, timestamp } = payload;

  console.log(`Internal deposit received`);
  console.log(`Amount: ${symbol} ${amount} from wallet ${from} → ${to}`);
  console.log(`Status: ${status}`);
  console.log(`Time: ${timestamp}`);

  if (note) {
    console.log(`Message from sender: "${note}"`);
  }

  // Credit the recipient's account balance in your system
}
```

---

### Common Webhook Event Types

| Event Type                | Direction | Description                                    |
| ------------------------- | --------- | ---------------------------------------------- |
| `bank_transfer.debit`     | Outgoing  | Bank transfer sent to an external bank account |
| `bank_transfer.credit`    | Incoming  | Bank transfer received from an external source |
| `wallet.deposit`          | Incoming  | Wallet deposit received (external/crypto)      |
| `wallet.deposit.internal` | Incoming  | Internal wallet deposit received               |
| `transaction.withdrawal`  | Outgoing  | Internal wallet withdrawal sent                |

> **Security Note:** Always verify webhook authenticity and use the SDK's `verify()` method to confirm transaction details before updating your system.

```typescript
// Always verify the transaction after receiving a webhook
async function onWebhookReceived(payload: any) {
  if (payload.data?.transaction_id || payload.transactionId) {
    const txId = payload.data?.transaction_id || payload.transactionId;
    const verified = await client.verify(txId);

    if (verified.status !== "success") {
      console.warn("Transaction verification failed — ignoring webhook");
      return;
    }
  }

  // Safe to process
}
```

> **Note:** Refer to the [100Pay API documentation](https://documenter.getpostman.com/view/13045730/2s93RMUatE) for a complete list of webhook events and their payloads.

## Resources

- [100Pay Platform](https://100pay.co)
- [100Developers Portal](https://100pay.co) - Get your API keys here
- [API Documentation](https://documenter.getpostman.com/view/13045730/2s93RMUatE)

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/shop100global/100pay.js.git
cd 100pay.js

# Install dependencies
npm install

# Build the project
npm run build
```

### Available Scripts

- `npm run build` - Build the TypeScript code
- `npm run build:clean` - Clean the dist directory and build
- `npm run test` - Run tests
- `npm run lint` - Lint the code
- `npm run lint:fix` - Lint and fix code

## License

[MIT License](LICENSE.md)
