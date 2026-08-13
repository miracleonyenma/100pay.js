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
