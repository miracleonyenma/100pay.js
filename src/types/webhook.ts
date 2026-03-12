export interface IBankTransferWithdrawalWebhook {
  eventType: "bank_transfer.debit";
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
    type: "debit";
    [key: string]: unknown;
  };
  data: {
    type: "Outwards";
    sessionId: string;
    paymentReference: string;
    provider: string;
    creditAccountName: string;
    creditAccountNumber: string;
    debitAccountName: string;
    amount: number;
    fees: number;
    status: "Created" | "Processing" | "Successful" | "Failed";
    [key: string]: unknown;
  };
}

export interface IPaymentChargeWebhook {
  type: "credit";
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
      [key: string]: unknown;
    };
    charge: {
      customer: { user_id: string; name: string; email: string; phone: string };
      billing: { currency: string; amount: string; description: string; [key: string]: unknown };
      status: { value: string; total_paid: number; [key: string]: unknown };
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  appId: string;
  cryptoChargeId: string;
  createdAt: string;
}

export interface IInternalTransferWithdrawalWebhook {
  eventType: "transaction.withdrawal";
  eventId: string;
  timestamp: string;
  transactionId: string;
  transactionHash: string;
  amount: string;
  currency: string;
  type: "debit";
  status: "successful" | "pending" | "failed";
  description: string;
  from: string;
  to: string;
  category: "internal_transfer";
  metadata: {
    transferType: "internal";
    recipientWalletId: string;
    recipientUserId: string;
    note?: string;
    [key: string]: unknown;
  };
}

export interface IInternalTransferDepositWebhook {
  eventType: "wallet.deposit.internal";
  transactionHash: string;
  status: "successful" | "pending" | "failed";
  amount: string;
  category: string;
  _id: string;
  transactionSignature: string;
  from: string;
  symbol: string;
  to: string;
  type: "credit";
  transferType: "internal";
  note?: string;
  network?: string;
  timestamp: string;
  [key: string]: unknown;
}

export type WebhookEventPayload = 
  | IBankTransferWithdrawalWebhook 
  | IPaymentChargeWebhook 
  | IInternalTransferWithdrawalWebhook 
  | IInternalTransferDepositWebhook;

