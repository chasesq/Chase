// Demo credentials for development and testing
// Username: CHUN HUNG
// Password: Chun200@ (hashed using bcrypt)
// NEVER use these in production - for development/demo only

export const DEMO_CREDENTIALS = {
  firstName: "CHUN",
  lastName: "HUNG",
  email: "chun.hung@demo.example.com",
  username: "CHUN HUNG",
  // This is a bcrypt hash of "Chun200@"
  // To generate: bcrypt.hash("Chun200@", 10)
  passwordHash: "$2b$10$YourHashedPasswordHere", // Replace with actual bcrypt hash
  // Plain text ONLY for reference - NEVER store this
  passwordPlain: "Chun200@",
}

// New user credentials - Lin Huang
// Email: linhuang011@gmail.com
// Password: Lin2000
// Account Number: CHK-****7890
// Initial Balance: $0 (Admin can transfer funds to this account)
export const LIN_HUANG_CREDENTIALS = {
  id: 'user-lin-huang-001',
  firstName: "Lin",
  lastName: "Huang",
  email: "linhuang011@gmail.com",
  username: "LIN_HUANG",
  // This is a bcrypt hash of "Lin2000"
  // To generate: bcrypt.hash("Lin2000", 10)
  passwordHash: "$2b$10$8q6VQU.8n7K1R0P8V9L2wubBnfJ5l5Y3V3H5C0U0R1E9X0M0Z9R6K",
  // Plain text ONLY for reference - NEVER store this
  passwordPlain: "Lin2000",
  phone: "+1-415-555-0147",
  address: "456 Technology Lane, San Francisco, CA 94105",
  memberSince: "2024-04-04",
  tier: "premium",
}

export const DEMO_ACCOUNTS = [
  {
    accountType: "Checking",
    accountNumber: "****5001",
    balance: 5250.75,
    currency: "USD",
  },
  {
    accountType: "Savings",
    accountNumber: "****5002",
    balance: 12500.00,
    currency: "USD",
  },
  {
    accountType: "Money Market",
    accountNumber: "****5003",
    balance: 25000.50,
    currency: "USD",
  },
]

// Lin Huang's accounts (for admin transfers)
export const LIN_HUANG_ACCOUNTS = [
  {
    id: 'acc-lin-checking-001',
    accountType: "Checking",
    accountNumber: "CHK-****7890",
    balance: 0,
    currency: "USD",
    available: true,
    description: "Primary checking account - ready to receive transfers",
  },
  {
    id: 'acc-lin-savings-001',
    accountType: "Savings",
    accountNumber: "SAV-****7891",
    balance: 0,
    currency: "USD",
    available: true,
    description: "Savings account - ready to receive transfers",
  },
]

export const DEMO_TRANSACTIONS = [
  {
    type: "transfer",
    amount: 500.00,
    description: "Transfer to Savings",
    timestamp: new Date(Date.now() - 86400000),
  },
  {
    type: "payment",
    amount: 150.00,
    description: "Utilities Bill Payment",
    timestamp: new Date(Date.now() - 172800000),
  },
  {
    type: "deposit",
    amount: 1000.00,
    description: "Direct Deposit",
    timestamp: new Date(Date.now() - 259200000),
  },
]
