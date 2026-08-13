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
