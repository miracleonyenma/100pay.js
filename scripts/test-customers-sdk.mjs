import assert from "node:assert/strict";
import { Pay100 } from "../dist/index.js";

const calls = [];
let responses = [];

globalThis.fetch = async (url, options) => {
  calls.push({ url: String(url), options });
  const response = responses.shift();
  if (!response) throw new Error("No mocked response configured");
  return response;
};

function jsonResponse(data, { status = 200, etag = '"1"' } = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ETag: etag },
  });
}

const sdk = new Pay100({
  publicKey: "LIVE;PK;test",
  secretKey: "LIVE;SK;test",
  baseUrl: "https://api.test",
});

const customer = {
  id: "cus_01hv3x9k2m8q4r6t8w0y2a4c6e",
  type: "individual",
  externalReference: "merchant-customer-1",
  firstName: "Ada",
  middleName: null,
  lastName: "Obi",
  displayName: null,
  email: "ada@example.com",
  phone: null,
  status: "active",
  statusControls: {
    merchant: { status: "active", reason: null, changedAt: null },
    platform: { status: "active", reason: null, changedAt: null },
    effectiveOrigin: null,
  },
  profileCompleteness: "complete",
  metadata: {},
  createdAt: "2026-08-13T00:00:00.000Z",
  updatedAt: "2026-08-13T00:00:00.000Z",
  deletedAt: null,
  _links: { self: "/api/v1/customers/cus_01hv3x9k2m8q4r6t8w0y2a4c6e" },
};

responses.push(
  jsonResponse(
    { success: true, message: "Customer created", data: customer },
    { status: 201, etag: '"1"' }
  )
);
const created = await sdk.customer.create(
  {
    externalReference: "merchant-customer-1",
    firstName: "Ada",
    lastName: "Obi",
    email: "ada@example.com",
  },
  { idempotencyKey: "create-1" }
);
assert.equal(created.etag, '"1"');
assert.equal(calls.at(-1).url, "https://api.test/api/v1/customers");
assert.equal(calls.at(-1).options.method, "POST");
assert.equal(calls.at(-1).options.headers["Idempotency-Key"], "create-1");

responses.push(
  jsonResponse({
    success: true,
    message: "Customers retrieved",
    data: [customer],
    meta: { pagination: { page: 1, limit: 20, totalItems: 1, totalPages: 1 } },
  })
);
await sdk.customer.list({ page: 1, limit: 20, search: undefined });
assert.equal(
  calls.at(-1).url,
  "https://api.test/api/v1/customers?page=1&limit=20"
);
assert.equal(calls.at(-1).options.method, "GET");

responses.push(
  jsonResponse(
    {
      success: true,
      message: "Customer updated",
      data: { ...customer, displayName: "Ada O." },
      meta: {
        verificationImpact: {
          staled: false,
          recordsUpdated: 0,
          profileUpdated: false,
          reason: null,
        },
      },
    },
    { etag: '"2"' }
  )
);
const updated = await sdk.customer.update(
  customer.id,
  { displayName: "Ada O." },
  { idempotencyKey: "update-1", ifMatch: '"1"' }
);
assert.equal(updated.etag, '"2"');
assert.equal(calls.at(-1).options.method, "PATCH");
assert.equal(calls.at(-1).options.headers["If-Match"], '"1"');

responses.push(
  jsonResponse(
    {
      success: true,
      message: "Customer suspend command applied",
      data: {
        ...customer,
        status: "suspended",
        statusControls: {
          ...customer.statusControls,
          merchant: {
            status: "suspended",
            reason: "Review",
            changedAt: "2026-08-13T00:01:00.000Z",
          },
          effectiveOrigin: "merchant",
        },
      },
      meta: {
        lifecycleImpact: {
          changed: true,
          previousStatus: "active",
          effectiveStatus: "suspended",
          platformControlRemains: false,
        },
      },
    },
    { etag: '"3"' }
  )
);
const suspended = await sdk.customer.suspend(
  customer.id,
  { reason: "Review" },
  { idempotencyKey: "suspend-1", ifMatch: '"2"' }
);
assert.equal(suspended.etag, '"3"');
assert.equal(
  calls.at(-1).url,
  `https://api.test/api/v1/customers/${customer.id}/suspend`
);

const verification = {
  id: "ver_01hv3x9k2m8q4r6t8w0y2a4c6e",
  customerId: customer.id,
  method: "bvn",
  status: "pending",
  eligibility: {
    status: "pending",
    isCurrent: false,
    expiresAt: null,
    staleAt: null,
    staleReason: null,
  },
  match: {
    overallStatus: null,
    fields: { firstname: null, lastname: null },
  },
  identifiers: [{ kind: "bvn", masked: "*******8901" }],
  policy: { id: "vpol_00000000000000000000000000", version: 1 },
  initiatedAt: "2026-08-13T00:02:00.000Z",
  completedAt: null,
  updatedAt: "2026-08-13T00:02:00.000Z",
  _links: {
    self: `/api/v1/customers/${customer.id}/identity-verifications/ver_01hv3x9k2m8q4r6t8w0y2a4c6e`,
  },
};
responses.push(
  jsonResponse(
    {
      success: true,
      message: "Identity verification accepted for processing",
      data: verification,
      meta: { existing: false },
    },
    { status: 202, etag: '"ver-1"' }
  )
);
const verificationCreated = await sdk.customer.identityVerification.create(
  customer.id,
  { method: "bvn", bvn: "12345678901" },
  { idempotencyKey: "verification-create-1" }
);
assert.equal(verificationCreated.etag, '"ver-1"');
assert.equal(
  calls.at(-1).url,
  `https://api.test/api/v1/customers/${customer.id}/identity-verifications`
);
assert.equal(calls.at(-1).options.headers["Idempotency-Key"], "verification-create-1");

responses.push(
  jsonResponse({
    success: true,
    message: "Customer identity verifications retrieved",
    data: [verification],
    meta: { pagination: { page: 1, limit: 20, totalItems: 1, totalPages: 1 } },
  })
);
await sdk.customer.identityVerification.list(customer.id, {
  page: 1,
  isCurrent: false,
});
assert.equal(
  calls.at(-1).url,
  `https://api.test/api/v1/customers/${customer.id}/identity-verifications?page=1&isCurrent=false`
);

responses.push(
  jsonResponse(
    {
      success: true,
      message: "Customer identity verification retrieved",
      data: verification,
    },
    { etag: '"ver-2"' }
  )
);
const verificationRead = await sdk.customer.identityVerification.get(
  customer.id,
  verification.id
);
assert.equal(verificationRead.etag, '"ver-2"');

const virtualBankAccount = {
  id: "vba_01hv3x9k2m8q4r6t8w0y2a4c6e",
  customerId: customer.id,
  walletId: "wal_01hv3x9k2m8q4r6t8w0y2a4c6e",
  identityVerificationId: verification.id,
  externalReference: "merchant-vba-001",
  account: null,
  currency: "NGN",
  status: "pending",
  autoSweep: { enabled: true, destination: { accountNumber: "******1111" } },
  providerBalance: {
    status: "unavailable",
    availableDecimal: null,
    bookDecimal: null,
    asOf: null,
    reason: null,
  },
  failure: null,
  createdAt: "2026-08-13T00:03:00.000Z",
  updatedAt: "2026-08-13T00:03:00.000Z",
  _links: {},
};
responses.push(
  jsonResponse(
    {
      success: true,
      message: "Virtual bank account accepted for processing",
      data: virtualBankAccount,
    },
    { status: 202, etag: '"vba-1"' }
  )
);
const vbaCreated = await sdk.customer.virtualBankAccount.create(
  customer.id,
  {
    identityVerificationId: verification.id,
    externalReference: "merchant-vba-001",
  },
  { idempotencyKey: "vba-create-1" }
);
assert.equal(vbaCreated.etag, '"vba-1"');
assert.equal(
  calls.at(-1).url,
  `https://api.test/api/v1/customers/${customer.id}/virtual-bank-accounts`
);
assert.equal(calls.at(-1).options.headers["Idempotency-Key"], "vba-create-1");

responses.push(
  jsonResponse({
    success: true,
    message: "Customer virtual bank accounts retrieved",
    data: [virtualBankAccount],
    meta: { pagination: { page: 1, limit: 20, totalItems: 1, totalPages: 1 } },
  })
);
await sdk.customer.virtualBankAccount.list(customer.id, {
  page: 1,
  status: "pending",
});
assert.equal(
  calls.at(-1).url,
  `https://api.test/api/v1/customers/${customer.id}/virtual-bank-accounts?page=1&status=pending`
);

responses.push(
  jsonResponse(
    {
      success: true,
      message: "Customer virtual bank account retrieved",
      data: virtualBankAccount,
    },
    { etag: '"vba-2"' }
  )
);
const vbaRead = await sdk.customer.virtualBankAccount.get(
  customer.id,
  virtualBankAccount.id
);
assert.equal(vbaRead.etag, '"vba-2"');

responses.push(
  jsonResponse(
    {
      success: true,
      message: "Virtual bank account retry accepted for processing",
      data: virtualBankAccount,
    },
    { status: 202, etag: '"vba-3"' }
  )
);
const vbaRetried = await sdk.customer.virtualBankAccount.retry(
  customer.id,
  virtualBankAccount.id,
  { idempotencyKey: "vba-retry-1", ifMatch: '"vba-2"' }
);
assert.equal(vbaRetried.etag, '"vba-3"');
assert.equal(
  calls.at(-1).url,
  `https://api.test/api/v1/customers/${customer.id}/virtual-bank-accounts/${virtualBankAccount.id}/retry`
);
assert.equal(calls.at(-1).options.headers["Idempotency-Key"], "vba-retry-1");
assert.equal(calls.at(-1).options.headers["If-Match"], '"vba-2"');

responses.push(
  jsonResponse({
    success: true,
    message: "Customer wallet balance retrieved",
    data: {
      walletId: virtualBankAccount.walletId,
      customerId: customer.id,
      currency: "NGN",
      status: "active",
      ledger: {
        available: 4975,
        total: 4975,
        pendingCredit: 0,
        pendingDebit: 0,
        transactionCount: 2,
      },
      asOf: "2026-08-14T00:00:00.000Z",
    },
  })
);
const walletBalance = await sdk.customer.wallet.getBalance(
  customer.id,
  virtualBankAccount.walletId
);
assert.equal(walletBalance.data.ledger.available, 4975);
assert.equal(
  calls.at(-1).url,
  `https://api.test/api/v1/customers/${customer.id}/wallets/${virtualBankAccount.walletId}/balance`
);

responses.push(
  jsonResponse({
    success: true,
    message: "Customer wallet transactions retrieved",
    data: [],
    meta: { pagination: { page: 1, limit: 20, totalItems: 0, totalPages: 1 } },
  })
);
await sdk.customer.wallet.listTransactions(customer.id, virtualBankAccount.walletId, {
  page: 1,
  type: "credit",
});
assert.equal(
  calls.at(-1).url,
  `https://api.test/api/v1/customers/${customer.id}/wallets/${virtualBankAccount.walletId}/transactions?page=1&type=credit`
);

responses.push(
  jsonResponse(
    {
      success: true,
      message: "Withdrawal accepted and processing",
      data: {
        reference: "PAYREF-1",
        transactionReference: "SESSION-1",
        customerId: customer.id,
        walletId: virtualBankAccount.walletId,
        type: "bank_transfer",
        status: "pending",
        amount: "1000",
        fee: "25",
        currency: "NGN",
        beneficiary: { bankCode: "100004", accountNumber: "******5549", accountName: "ADA OBI" },
        createdAt: "2026-08-14T00:00:00.000Z",
      },
    },
    { status: 202 }
  )
);
const withdrawal = await sdk.customer.wallet.withdraw(
  customer.id,
  virtualBankAccount.walletId,
  { amount: 1000, beneficiaryBankCode: "100004", beneficiaryAccountNumber: "8135155549" },
  { idempotencyKey: "withdraw-1" }
);
assert.equal(withdrawal.data.status, "pending");
assert.equal(
  calls.at(-1).url,
  `https://api.test/api/v1/customers/${customer.id}/wallets/${virtualBankAccount.walletId}/withdrawals`
);
assert.equal(calls.at(-1).options.headers["Idempotency-Key"], "withdraw-1");

responses.push(
  jsonResponse({
    success: true,
    message: "Withdrawal is allowed",
    data: {
      customerId: customer.id,
      walletId: virtualBankAccount.walletId,
      currency: "NGN",
      amount: "1000",
      fee: "25",
      totalDebit: "1025",
      balance: { available: 5000, projectedAfter: 3975 },
      limits: { minAmount: 100, maxAmount: 500000 },
      allowed: true,
      reasons: [],
      asOf: "2026-08-14T00:00:00.000Z",
    },
  })
);
const preflight = await sdk.customer.wallet.preflightWithdrawal(
  customer.id,
  virtualBankAccount.walletId,
  { amount: 1000 }
);
assert.equal(preflight.data.allowed, true);
assert.equal(
  calls.at(-1).url,
  `https://api.test/api/v1/customers/${customer.id}/wallets/${virtualBankAccount.walletId}/withdrawals/preflight`
);

responses.push(
  jsonResponse(
    {
      success: true,
      message: "Internal transfer completed",
      data: {
        reference: "linked-1",
        debitReference: "internal-transfer-dr-1",
        creditReference: "internal-transfer-cr-1",
        customerId: customer.id,
        walletId: virtualBankAccount.walletId,
        type: "internal_transfer",
        destination: "merchant",
        status: "successful",
        amount: "2000",
        fee: "0",
        currency: "NGN",
        atomic: true,
        createdAt: "2026-08-14T00:00:00.000Z",
      },
    },
    { status: 201 }
  )
);
const internalTransfer = await sdk.customer.wallet.transferToMerchant(
  customer.id,
  virtualBankAccount.walletId,
  { destination: "merchant", amount: 2000 },
  { idempotencyKey: "transfer-1" }
);
assert.equal(internalTransfer.data.atomic, true);
assert.equal(
  calls.at(-1).url,
  `https://api.test/api/v1/customers/${customer.id}/wallets/${virtualBankAccount.walletId}/transfers`
);
assert.equal(calls.at(-1).options.headers["Idempotency-Key"], "transfer-1");

responses.push(new Response(null, { status: 204 }));
const deleted = await sdk.customer.delete(
  customer.id,
  { reason: "Requested closure" },
  { idempotencyKey: "delete-1", ifMatch: '"3"' }
);
assert.equal(deleted, undefined);
assert.equal(calls.at(-1).options.method, "DELETE");
assert.equal(calls.at(-1).options.headers["Idempotency-Key"], "delete-1");

assert.equal(responses.length, 0);
console.log("Customer SDK contract checks passed");
