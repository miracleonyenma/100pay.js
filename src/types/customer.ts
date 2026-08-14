export type CustomerStatus =
  | "active"
  | "restricted"
  | "suspended"
  | "deleted";

export type CustomerControlStatus = "active" | "restricted" | "suspended";

export interface ICustomerStatusControl {
  status: CustomerControlStatus;
  reason: string | null;
  changedAt: string | null;
}

export interface ICustomerSummary {
  wallets: { total: number; operational: number };
  virtualBankAccounts: { total: number; operational: number };
  currentVerification: {
    id: string | null;
    status: string;
    eligibilityStatus: string;
    expiresAt: string | null;
  } | null;
}

export interface ICustomer {
  id: string;
  type: "individual";
  externalReference: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  displayName: string | null;
  email: string | null;
  phone: string | null;
  status: CustomerStatus;
  statusControls: {
    merchant: ICustomerStatusControl;
    platform: ICustomerStatusControl;
    effectiveOrigin: "merchant" | "platform" | null;
  };
  profileCompleteness: "complete" | "incomplete";
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  _links: Record<string, string>;
  summary?: ICustomerSummary;
}

export interface ICreateCustomerData extends Record<string, unknown> {
  externalReference: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  displayName?: string;
  email?: string;
  phone?: string;
  metadata?: Record<string, unknown>;
}

export interface IUpdateCustomerData extends Record<string, unknown> {
  firstName?: string;
  middleName?: string | null;
  lastName?: string;
  displayName?: string | null;
  email?: string;
  phone?: string;
  metadata?: Record<string, unknown>;
}

export interface IListCustomersParams extends Record<string, unknown> {
  page?: number;
  limit?: number;
  externalReference?: string;
  email?: string;
  phone?: string;
  status?: CustomerStatus;
  search?: string;
  createdAfter?: string;
  createdBefore?: string;
  sort?: "createdAt:desc" | "createdAt:asc";
}

export interface ICustomerPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface ICustomerResponse {
  success: true;
  message: string;
  data: ICustomer;
  /** Strong ETag captured from the HTTP response header. */
  etag: string | null;
  meta?: Record<string, unknown>;
}

export interface ICustomerVerificationImpact {
  staled: boolean;
  recordsUpdated: number;
  profileUpdated: boolean;
  reason: string | null;
}

export interface IUpdateCustomerResponse extends ICustomerResponse {
  meta: { verificationImpact: ICustomerVerificationImpact };
}

export interface ICustomerListResponse {
  success: true;
  message: string;
  data: ICustomer[];
  meta: { pagination: ICustomerPagination };
}

export interface IIdempotentRequestOptions {
  /** Unique per logical operation; reuse only when retrying the same request. */
  idempotencyKey: string;
}

export interface IConditionalCustomerWriteOptions
  extends IIdempotentRequestOptions {
  /** Current ETag returned by get/create/update, including quotes (e.g. `"3"`). */
  ifMatch: string;
}

export interface IDeleteCustomerData extends Record<string, unknown> {
  reason?: string;
}

export interface ICustomerLifecycleCommandData extends Record<string, unknown> {
  reason: string;
}

export interface ICustomerLifecycleImpact {
  changed: boolean;
  previousStatus: Exclude<CustomerStatus, "deleted">;
  effectiveStatus: Exclude<CustomerStatus, "deleted">;
  platformControlRemains: boolean;
}

export interface ICustomerLifecycleResponse extends ICustomerResponse {
  meta: { lifecycleImpact: ICustomerLifecycleImpact };
}

export type CustomerVerificationStatus =
  | "initiated"
  | "pending"
  | "processing"
  | "verified"
  | "failed"
  | "rejected"
  | "canceled"
  | "expired"
  | "manual_review";

export type CustomerVerificationEligibilityStatus =
  | "pending"
  | "eligible"
  | "ineligible"
  | "manual_review"
  | "stale";

export interface ICustomerIdentityVerification {
  id: string;
  customerId: string;
  method: "bvn" | "nin" | "vnin";
  status: CustomerVerificationStatus;
  eligibility: {
    status: CustomerVerificationEligibilityStatus;
    isCurrent: boolean;
    expiresAt: string | null;
    staleAt: string | null;
    staleReason: string | null;
  };
  match: {
    overallStatus: string | null;
    fields: { firstname: boolean | null; lastname: boolean | null };
  };
  identifiers: Array<{
    kind: "bvn" | "nin" | "vnin";
    masked: string | null;
  }>;
  policy: { id: string | null; version: number | null } | null;
  initiatedAt: string | null;
  completedAt: string | null;
  updatedAt: string | null;
  _links: Record<string, string>;
}

export interface ICreateCustomerVerificationData
  extends Record<string, unknown> {
  method: "bvn";
  bvn: string;
}

export interface IListCustomerVerificationsParams
  extends Record<string, unknown> {
  page?: number;
  limit?: number;
  method?: "bvn" | "nin" | "vnin";
  status?: CustomerVerificationStatus;
  eligibilityStatus?: CustomerVerificationEligibilityStatus;
  isCurrent?: boolean;
  sort?: "createdAt:desc" | "createdAt:asc";
}

export interface ICustomerVerificationResponse {
  success: true;
  message: string;
  data: ICustomerIdentityVerification;
  etag: string | null;
  meta?: Record<string, unknown>;
}

export interface ICreateCustomerVerificationResponse
  extends ICustomerVerificationResponse {
  meta: { existing: boolean };
}

export interface ICustomerVerificationListResponse {
  success: true;
  message: string;
  data: ICustomerIdentityVerification[];
  meta: { pagination: ICustomerPagination };
}

export type CustomerVirtualBankAccountStatus =
  | "pending"
  | "active"
  | "suspended"
  | "closed"
  | "failed";

export interface ICustomerVirtualBankAccount {
  id: string;
  customerId: string;
  walletId: string;
  identityVerificationId: string;
  externalReference: string;
  account: {
    number: string;
    name: string | null;
    bankCode: string | null;
    bankName: string;
  } | null;
  currency: "NGN";
  status: CustomerVirtualBankAccountStatus;
  autoSweep: {
    enabled: boolean;
    sweepDestination: CustomerVbaSweepDestination;
    destination: { accountNumber: string | null } | null;
  };
  providerBalance: {
    status: "available" | "unavailable";
    availableDecimal: string | null;
    bookDecimal: string | null;
    asOf: string | null;
    reason: string | null;
  };
  failure: { code: string; message: string | null } | null;
  createdAt: string;
  updatedAt: string;
  _links: Record<string, string>;
}

export type CustomerVbaSweepDestination =
  | "none"
  | "merchant_settlement"
  | "merchant_vba"
  | "platform";

export interface ICreateCustomerVirtualBankAccountData
  extends Record<string, unknown> {
  identityVerificationId: string;
  externalReference: string;
  /** Legacy toggle; false is equivalent to sweepDestination "none". */
  autoSweep?: boolean;
  /**
   * Where deposits physically settle. Defaults to the app-level setting
   * (platform settlement account unless configured otherwise).
   */
  sweepDestination?: CustomerVbaSweepDestination;
  /**
   * Who pays deposit processing fees. "merchant" sponsors from your main NGN
   * wallet with customer fallback when your balance is insufficient.
   */
  depositFeeBearer?: "customer" | "merchant";
}

export interface IListCustomerVirtualBankAccountsParams
  extends Record<string, unknown> {
  page?: number;
  limit?: number;
  status?: CustomerVirtualBankAccountStatus;
  externalReference?: string;
  sort?: "createdAt:desc" | "createdAt:asc";
}

export interface ICustomerVirtualBankAccountResponse {
  success: true;
  message: string;
  data: ICustomerVirtualBankAccount;
  etag: string | null;
  meta?: Record<string, unknown>;
}

export interface ICustomerVirtualBankAccountListResponse {
  success: true;
  message: string;
  data: ICustomerVirtualBankAccount[];
  meta: { pagination: ICustomerPagination };
}

export interface ICustomerWalletBalance {
  walletId: string;
  customerId: string;
  currency: string;
  status: string;
  /** true when the ledger is negative; outgoing transfers are blocked */
  restricted: boolean;
  ledger: {
    available: number;
    total: number;
    pendingCredit: number;
    pendingDebit: number;
    transactionCount: number;
  };
  asOf: string;
}

export interface ICustomerWalletBalanceResponse {
  success: true;
  message: string;
  data: ICustomerWalletBalance;
  etag: string | null;
  meta?: Record<string, unknown>;
}

export interface ICustomerWalletTransaction {
  reference: string | null;
  customerId: string;
  walletId: string;
  type: "credit" | "debit";
  status: "pending" | "successful" | "failed" | "reversed";
  amount: string;
  currency: string;
  category: string | null;
  description: string | null;
  from: string | null;
  to: string | null;
  relatedReference: string | null;
  createdAt: string;
}

export interface IListCustomerWalletTransactionsParams
  extends Record<string, unknown> {
  page?: number;
  limit?: number;
  type?: "credit" | "debit";
  status?: "pending" | "successful" | "failed" | "reversed";
  sort?: "createdAt:desc" | "createdAt:asc";
}

export interface ICustomerWalletTransactionListResponse {
  success: true;
  message: string;
  data: ICustomerWalletTransaction[];
  meta: { pagination: ICustomerPagination };
}

export interface ICreateCustomerWithdrawalData extends Record<string, unknown> {
  amount: number;
  /** A saved app-scoped beneficiary ID; replaces bank code + account number */
  beneficiaryId?: string;
  beneficiaryBankCode?: string;
  beneficiaryAccountNumber?: string;
  /** Save this destination as an app-scoped beneficiary for reuse */
  saveBeneficiary?: boolean;
  narration?: string;
  externalReference?: string;
  /** Interactive dashboard sessions only; SK/OAuth callers must omit it */
  transactionPin?: string;
}

export interface ICustomerWithdrawalBeneficiary {
  id: string;
  accountName: string | null;
  accountNumber: string;
  bankCode: string;
  bankName: string | null;
  createdAt: string;
}

export interface ICustomerBeneficiaryListResponse {
  success: true;
  message: string;
  data: ICustomerWithdrawalBeneficiary[];
  meta: { pagination: ICustomerPagination };
}

export interface ICustomerWithdrawal {
  reference: string | null;
  transactionReference: string | null;
  customerId: string;
  walletId: string;
  type: "bank_transfer";
  status: "pending" | "successful" | "failed";
  amount: string;
  fee: string;
  currency: "NGN";
  beneficiary: {
    bankCode: string;
    accountNumber: string;
    accountName: string | null;
  };
  createdAt: string;
}

export interface ICustomerWithdrawalResponse {
  success: true;
  message: string;
  data: ICustomerWithdrawal;
  etag: string | null;
  meta?: Record<string, unknown>;
}

export interface ICustomerWithdrawalStatus {
  reference: string | null;
  transactionReference: string;
  customerId: string;
  walletId: string;
  type: "bank_transfer";
  status: "pending" | "successful" | "failed" | "reversed";
  amount: string;
  fee: string;
  currency: string;
  description: string | null;
  /** true while the provider outcome has not been recorded yet */
  processing: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICustomerWithdrawalStatusResponse {
  success: true;
  message: string;
  data: ICustomerWithdrawalStatus;
  etag: string | null;
  meta?: Record<string, unknown>;
}

export interface ICustomerWithdrawalPreflightData
  extends Record<string, unknown> {
  amount: number;
}

export interface ICustomerWithdrawalPreflight {
  customerId: string;
  walletId: string;
  currency: "NGN";
  amount: string;
  fee: string;
  totalDebit: string;
  balance: { available: number; projectedAfter: number };
  limits: {
    minAmount: number;
    maxAmount: number;
    rolling24hMax: number;
    rolling24hUsed: number;
    rolling24hRemaining: number;
  };
  policy: { id: string; version: number };
  allowed: boolean;
  reasons: Array<
    | "below_minimum_amount"
    | "above_maximum_amount"
    | "daily_limit_exceeded"
    | "negative_balance"
    | "insufficient_balance"
    | "customer_not_active"
  >;
  asOf: string;
}

export interface ICustomerWithdrawalPreflightResponse {
  success: true;
  message: string;
  data: ICustomerWithdrawalPreflight;
  etag: string | null;
  meta?: Record<string, unknown>;
}

export interface ICreateCustomerInternalTransferData
  extends Record<string, unknown> {
  destination: "merchant";
  amount: number;
  narration?: string;
  /** Interactive dashboard sessions only; SK/OAuth callers must omit it */
  transactionPin?: string;
}

export interface ICustomerInternalTransfer {
  reference: string | null;
  debitReference: string | null;
  creditReference: string | null;
  customerId: string;
  walletId: string;
  type: "internal_transfer";
  destination: "merchant";
  status: "successful";
  amount: string;
  fee: string;
  currency: "NGN";
  atomic: boolean;
  createdAt: string;
}

export interface ICustomerInternalTransferResponse {
  success: true;
  message: string;
  data: ICustomerInternalTransfer;
  etag: string | null;
  meta?: Record<string, unknown>;
}

export interface ICustomerTransferLimitBucket {
  limits: {
    perTransactionMin: number;
    perTransactionMax: number;
    rolling24hMax: number;
  };
  override: {
    perTransactionMax: number | null;
    rolling24hMax: number | null;
  };
  usage: { rolling24h: number; reserved: number; remaining: number };
}

export interface ICustomerTransferLimits {
  customerId: string;
  currency: string;
  policy: {
    id: string;
    version: number;
    source: "app_override" | "global" | "builtin";
  };
  external: ICustomerTransferLimitBucket;
  internal: ICustomerTransferLimitBucket;
}

export interface ICustomerTransferLimitsResponse {
  success: true;
  message: string;
  data: ICustomerTransferLimits;
  etag: string | null;
  meta?: Record<string, unknown>;
}

export interface ISetCustomerTransferLimitsData
  extends Record<string, unknown> {
  external?: {
    perTransactionMax?: number | null;
    rolling24hMax?: number | null;
  };
  internal?: {
    perTransactionMax?: number | null;
    rolling24hMax?: number | null;
  };
}

export interface ICustomerBankingSettings {
  sweepDestination: CustomerVbaSweepDestination;
  depositFeeBearer: "customer" | "merchant";
  insufficientSponsorBehavior:
    | "charge_customer"
    | "create_merchant_receivable"
    | "hold_customer_deposit";
  /** Platform-set sponsored-fee exposure cap (read-only) */
  receivableLimit: number;
  version: number;
}

export interface ICustomerBankingSettingsResponse {
  success: true;
  message: string;
  data: ICustomerBankingSettings;
  etag: string | null;
  meta?: Record<string, unknown>;
}

export interface IUpdateCustomerBankingSettingsData
  extends Record<string, unknown> {
  sweepDestination?: CustomerVbaSweepDestination;
  depositFeeBearer?: "customer" | "merchant";
  insufficientSponsorBehavior?:
    | "charge_customer"
    | "create_merchant_receivable"
    | "hold_customer_deposit";
}
