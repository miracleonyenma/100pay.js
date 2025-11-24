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
      `Exchange rate: 1 BTC = ${preview.toRate / preview.fromRate} USDT`
    );
    console.log(
      `Total fees: ${preview.feeInUSD} USD (${preview.feeInFromCurrency} BTC)`
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
// Execute an asset transfer
const transfer = await client.transfer.executeTransfer({
  amount: 100,
  symbol: "USDT",
  to: "0x1234567890abcdef...",
  transferType: "external",
  note: "Payment for services",
  oauthAccessToken: "your_oauth_token", // Optional: for OAuth 2.0 authentication
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
  amount: number | string; // Amount to transfer (must be greater than zero)
  symbol: string; // Asset symbol/currency code
  to: string; // Destination address or account identifier
  transferType?: "internal" | "external"; // Type of transfer
  note?: string; // Optional note or memo
  oauthAccessToken?: string; // Optional OAuth 2.0 access token
}
```

**Transfer Response:**

```typescript
interface ITransferAssetResponse {
  statusCode: number;
  message: string;
  data: {
    receipt: string; // Transaction receipt/confirmation
    transactionId: string; // Unique transaction identifier
    timestamp: string | number; // Transaction timestamp
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
  customHeaders // Optional: custom headers (e.g., Authorization)
);
```

**Example:**

```typescript
// Get user app balance with custom headers
const balance = await client.request<BalanceResponse>(
  "GET",
  "/api/v1/user-apps/:appId/wallet-balance/:symbol",
  {},
  { Authorization: `Bearer ${accessToken}` }
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
    `Exchange rate: 1 USDT = ${preview.toRate / preview.fromRate} BTC`
  );
  console.log(
    `Fee: ${preview.feeInFromCurrency} USDT (${preview.feeInUSD} USD)`
  );
} else {
  // Handle enhanced response
  console.log("Enhanced conversion preview:", preview);
}
```

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
      bank.name?.includes("Access")
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
      tokenResponse.data.access_token
    );
    console.log(`User info:`, userInfoResponse.data);

    // 5. Get app info
    const appInfoResponse = await client.oauth.getAppInfo(
      tokenResponse.data.access_token
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

100Pay sends webhooks for various events. Here's an example bank transfer debit webhook payload:

```typescript
interface BankTransferWebhook {
  eventType: "bank_transfer.debit";
  transactionId: string;
  reference: string;
  amount: number;
  timestamp: string;
  transaction: {
    status: "pending" | "completed" | "failed";
    from: string;
    to: string;
    metadata: {
      paymentReference: string;
      description: string;
      fees: number;
    };
    // ... other fields
  };
  data: {
    sessionId: string;
    creditAccountName: string;
    creditAccountNumber: string;
    status: "Created" | "Processing" | "Successful" | "Failed";
    narration: string;
    fees: number;
    // ... other fields
  };
}
```

**Common Webhook Event Types:**

- `bank_transfer.debit` - Outgoing bank transfer initiated
- `bank_transfer.credit` - Incoming bank transfer received
- `wallet.deposit` - Wallet deposit received
- `wallet.deposit.internal` - Internal wallet deposit received

> **Note:** Refer to the [100Pay API documentation](https://documenter.getpostman.com/view/13045730/2s93RMUatE) for a complete list of webhook events and their payloads.

Always verify webhook signatures and use the SDK's `verify()` method to confirm transaction details.

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
