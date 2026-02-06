# 🔒 PrivaScore

**Privacy-Preserving Credit Scoring for DeFi**

PrivaScore enables underbanked individuals to prove their creditworthiness without exposing their financial history. By processing sensitive data in Trusted Execution Environments (TEE), we unlock undercollateralized lending in DeFi while preserving user privacy.

[![Demo Video](https://img.shields.io/badge/Demo-Watch%20Now-blue)](https://youtu.be/0m89f7kTCRg)
[![Live Demo](https://img.shields.io/badge/Demo-Try%20It-green)](https://privascore.vercel.app/)

---

## 🎯 The Problem

**2 billion people globally are underbanked**, yet they have valuable financial history:
- Mobile money payments (M-Pesa, PayPal)
- Gig economy earnings (Uber, Stripe)
- Utility and rent payments

**In DeFi, they're invisible.** Current lending requires:
- Over-collateralization (lock $150 to borrow $100), OR
- Exposing entire financial history on-chain forever

**PrivaScore solves this** by enabling credit verification without data exposure.

---

## 💡 Our Solution

```
Financial Data (Private) → TEE Processing → Credit Score (Verifiable)
     ↓                           ↓                    ↓
  Bank Statements          AI Analysis          zkProof Published
  M-Pesa History          Risk Assessment       Score Hash On-Chain
  PayPal Earnings         Privacy Preserved     Portable Identity
```

### How It Works

1. **Upload & Encrypt** - User uploads financial documents (CSV, PDF)
2. **TEE Processing** - Data processed in secure enclave via iExec
3. **Credit Scoring** - Algorithm analyzes:
   - Payment consistency (40%)
   - Income stability (30%)
   - Debt management (30%)
4. **Verifiable Output** - Only score hash published on-chain
5. **Borrow** - Use score across DeFi protocols

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │
│  (Next.js)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  iExec Data     │
│  Protector      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  TEE Worker     │
│  (Confidential) │
│                 │
│  ┌───────────┐  │
│  │ Python    │  │
│  │ Credit    │  │
│  │ Scorer    │  │
│  └───────────┘  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Smart Contract │
│  Score Storage  │
└─────────────────┘
```

### Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- iExec DataProtector SDK
- ethers.js

**Backend (TEE):**
- Python 3.13
- iExec TEE (SCONE)
- Docker
- Arbitrum Sepolia

**Blockchain:**
- Arbitrum Sepolia Testnet
- iExec Protocol
- Smart Contracts for score storage

---

## 🚀 Getting Started

### Prerequisites

```bash
# Required
- Node.js 18+
- MetaMask wallet
- Arbitrum Sepolia ETH (from faucet)
- Docker (for local testing)
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Ted1166/privascore.git
cd privascore
```

2. **Frontend Setup**
```bash
cd frontend
npm install
```

3. **Environment Configuration**
```bash
# Create .env.local
echo "NEXT_PUBLIC_IAPP_ADDRESS=0xd5728B47b7182A4C0944921c77fE158E2885F503" > .env.local
```

4. **Run Frontend**
```bash
npm run dev
# Open http://localhost:3000
```

### Backend (TEE App) Setup

1. **Navigate to TEE app**
```bash
cd iapp-credit-scorer
```

2. **Test locally**
```bash
iapp test --protectedData test-transactions
```

3. **Deploy to iExec**
```bash
iapp deploy
# Save the returned app address
```

---

## 📊 Demo Data

Sample CSV format for testing:

```csv
date,amount,description
01/01/2024,2500,Salary Deposit
01/05/2024,-800,Rent Payment
01/10/2024,-200,Groceries
01/15/2024,2500,Salary Deposit
01/20/2024,-150,Utilities
02/01/2024,2500,Salary Deposit
02/05/2024,-800,Rent Payment
02/15/2024,2500,Salary Deposit
```

**Format Requirements:**
- Header row: `date,amount,description`
- Positive amounts = income
- Negative amounts = expenses
- Minimum 5 transactions for meaningful score

---

## 🎬 Demo Flow

1. **Connect Wallet** - MetaMask on Arbitrum Sepolia
2. **Upload CSV** - Bank statement or financial history
3. **Process in TEE** - Data encrypted and analyzed privately
4. **View Score** - Credit score (300-850) with tier classification
5. **Request Loan** - Use score for undercollateralized borrowing

**Processing Time:** 2-5 minutes  
**Privacy:** Raw data never leaves TEE, only score hash on-chain

---

## 🔐 Privacy & Security

### How Privacy is Preserved

✅ **Data Encryption** - End-to-end encryption before upload  
✅ **TEE Processing** - Computation in hardware-isolated environment  
✅ **Zero-Knowledge Proof** - Only score hash published  
✅ **User Control** - Data owner decides who can access  
✅ **No Data Storage** - Raw data deleted after processing  

### Trust Model

- **Hardware Root of Trust**: Intel SGX / AMD SEV
- **Verifiable Computation**: iExec proof-of-execution
- **Decentralized**: No single point of failure
- **Auditable**: Open-source scoring algorithm

---

## 📈 Credit Scoring Algorithm

```python
# Scoring Components (out of 100 raw points)

1. Payment Consistency (40 points)
   - Ratio of positive to total transactions
   - Higher income frequency = better score

2. Income Stability (30 points)
   - Coefficient of variation in income
   - Lower variance = better score

3. Debt Management (30 points)
   - Debt-to-income ratio
   - Lower expenses/income = better score

# Final Score Calculation
raw_score = consistency + stability + debt_score
final_score = 300 + (raw_score * 5.5)  # Scale to 300-850
```

## 🌍 Real-World Impact

### Target Markets

**Emerging Markets:**
- 📱 M-Pesa users in Kenya 
- 💰 Mobile money in Nigeria, Ghana
- 🏦 Underbanked in Southeast Asia

**Developed Markets:**
- 🚗 Gig economy workers (Uber, DoorDash)
- 💼 Freelancers with irregular income
- 🎓 Young professionals without credit history

---

**Benefits:**
- Reduce default risk
- Expand user base
- Enable undercollateralized loans
- Increase protocol revenue

---

## 🧪 Testing

### Local Testing

```bash
# Test backend TEE app
cd iapp-credit-scorer
iapp test --protectedData test-transactions

# Expected output:
# ✓ Score: 665 (FAIR)
# ✓ Confidence: 16%
# ✓ Transaction count: 8
```

### Integration Testing

```bash
# Run frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

---

## 📝 Smart Contracts

### Deployed Contracts

**iApp Address (Arbitrum Sepolia):**
```
0xd5728B47b7182A4C0944921c77fE158E2885F503
```

**Score Storage Contract:**
```
Coming soon...
```

### Verify on Explorer

[View on Arbiscan](https://sepolia.arbiscan.io/address/0xd5728B47b7182A4C0944921c77fE158E2885F503)

---

## 🤝 Contributing

### Development Setup

1. Fork the repo
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Ted Adams** - Software Developer - [@yourtwitter](https://twitter.com/yourtwitter)

---

## 🙏 Acknowledgments

- **iExec** - For TEE infrastructure and DataProtector SDK
- **Arbitrum** - For scalable L2 infrastructure
- **Hackathon Organizers** - For the opportunity

---

## 📞 Contact

- **Website**: [privascore]([https://privascore.io](https://privascore.vercel.app/))
- **Twitter**: coming soon
- **Email**: ogolated00@gmail.com
- **Discord**: coming soon

---

<div align="center">

**Built with ❤️ for the Underbanked**

*Making Credit Accessible, Privacy Preserved*

</div>
