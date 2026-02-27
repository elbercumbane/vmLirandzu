export interface Configuration {
  company: {
    name: string;
    nif: string;
    addressMaputo: string;
    addressJHB: string;
    phoneMZ: string;
    phoneSA: string;
    email: string;
    logo?: string; // base64 or URL
  };
  fees: {
    defaultTransportFee: number; // MZN
    exchangeRateZAR_MZN: number;
  };
  users: User[];
  backup?: {
    lastBackup: Date;
    data: string; // JSON stringified
  };
}

export interface User {
  id: string;
  name: string;
  pin: string; // hash or simple PIN for MVP
  active: boolean;
  creationDate: Date;
}

