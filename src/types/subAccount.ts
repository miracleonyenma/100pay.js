// ./src/types/subAccount.ts

type CreateSubAccountData = {
  symbols: string[];
  networks: string[];
  owner: {
    name: string;
    email: string;
    phone: string;
  };
  metadata: Record<string, unknown>;
};

type CreateSubAccountResponse = {
  message: string;
  accounts: Account[];
};

type Account = {
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
};

type AccountDetails = {
  address: string;
  key: Key;
  network: string;
};

type Key = {
  version: number;
  id: string;
  address: string;
  crypto: Crypto;
};

type Crypto = {
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
};

export {
  CreateSubAccountData,
  CreateSubAccountResponse,
  Account,
  AccountDetails,
  Key,
  Crypto,
};
