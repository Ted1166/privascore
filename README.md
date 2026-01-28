# 🔒 PrivaScore

**Privacy-Preserving Credit Scoring for DeFi**

PrivaScore enables underbanked individuals to prove their creditworthiness without exposing their financial history. By processing sensitive data in Trusted Execution Environments (TEE), we unlock undercollateralized lending in DeFi while preserving user privacy.

[![Demo Video](https://img.shields.io/badge/Demo-Watch%20Now-blue)](YOUR_VIDEO_LINK)
[![Live Demo](https://img.shields.io/badge/Demo-Try%20It-green)](YOUR_DEMO_LINK)

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
git clone https://github.com/yourusername/privascore.git
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
echo "NEXT_PUBLIC_IAPP_ADDRESS=0xf75a2cfC9baF52FeB068619f8f1A9e90cF8CC848" > .env.local
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

### Tier Classification

| Score Range | Tier | Loan Eligibility |
|-------------|------|------------------|
| 750-850 | Excellent | Up to $10,000 |
| 700-749 | Good | Up to $5,000 |
| 650-699 | Fair | Up to $2,000 |
| 600-649 | Poor | Up to $1,000 |
| 300-599 | Very Poor | Limited |

---

## 🌍 Real-World Impact

### Target Markets

**Emerging Markets:**
- 📱 M-Pesa users in Kenya (30M+)
- 💰 Mobile money in Nigeria, Ghana
- 🏦 Underbanked in Southeast Asia

**Developed Markets:**
- 🚗 Gig economy workers (Uber, DoorDash)
- 💼 Freelancers with irregular income
- 🎓 Young professionals without credit history

### Market Size

- **2B+ underbanked globally**
- **$1T+ untapped credit market**
- **400M+ mobile money users**

---

## 🏆 Why PrivaScore Wins

### ✅ Technical Innovation
- Novel use of TEE for credit scoring
- First privacy-preserving credit oracle for DeFi
- Composable infrastructure (not just an app)

### ✅ Real-World Problem
- Addresses $1T+ market gap
- Solves actual financial exclusion
- Clear path to revenue (0.5% processing fee)

### ✅ DeFi Integration
- Enables undercollateralized lending
- Portable credit scores across protocols
- Verifiable without exposing data

### ✅ Privacy-First
- Perfect use case for confidential computing
- Users control their data
- Regulatory compliance (GDPR, CCPA)

---

## 🛣️ Roadmap

### Phase 1: MVP (Current) ✅
- [x] TEE credit scoring
- [x] CSV upload & processing
- [x] Score visualization
- [x] Arbitrum Sepolia deployment

### Phase 2: Beta (Q2 2026)
- [ ] API integrations (Plaid, M-Pesa)
- [ ] Multi-chain support (Ethereum, Polygon)
- [ ] Lending protocol partnerships
- [ ] Mobile app (iOS/Android)

### Phase 3: Production (Q3 2026)
- [ ] Mainnet launch
- [ ] Advanced ML models
- [ ] Credit history builder
- [ ] DeFi protocol SDK

### Phase 4: Scale (Q4 2026)
- [ ] Emerging market expansion
- [ ] Institutional partnerships
- [ ] Cross-border credit
- [ ] Regulatory compliance

---

## 🤝 For DeFi Protocols

**Integrate PrivaScore as a Credit Oracle**

```solidity
// Simple integration example
interface IPrivaScore {
    function getCreditScore(address user) external view returns (uint256);
    function getCreditTier(address user) external view returns (string memory);
}

contract UndercollateralizedLending {
    IPrivaScore privaScore;
    
    function borrow(uint256 amount) external {
        uint256 score = privaScore.getCreditScore(msg.sender);
        require(score >= 650, "Insufficient credit score");
        
        uint256 maxBorrow = calculateMaxBorrow(score);
        require(amount <= maxBorrow, "Exceeds credit limit");
        
        // Issue loan...
    }
}
```

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
0xf75a2cfC9baF52FeB068619f8f1A9e90cF8CC848
```

**Score Storage Contract:**
```
Coming soon...
```

### Verify on Explorer

[View on Arbiscan](https://sepolia.arbiscan.io/address/0xf75a2cfC9baF52FeB068619f8f1A9e90cF8CC848)

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

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

- **Your Name** - Founder & Developer - [@yourtwitter](https://twitter.com/yourtwitter)

---

## 🙏 Acknowledgments

- **iExec** - For TEE infrastructure and DataProtector SDK
- **Arbitrum** - For scalable L2 infrastructure
- **Hackathon Organizers** - For the opportunity

---

## 📞 Contact

- **Website**: [privascore.io](https://privascore.io)
- **Twitter**: [@PrivaScore](https://twitter.com/privascore)
- **Email**: hello@privascore.io
- **Discord**: [Join Community](https://discord.gg/privascore)

---

## 🎥 Demo Video

[![PrivaScore Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)

**Key Highlights:**
- 0:00 - Problem Overview
- 0:30 - Solution Demo
- 1:30 - TEE Processing
- 2:30 - Credit Score Result
- 3:00 - DeFi Integration

---

## 📊 Project Statistics

![GitHub stars](https://img.shields.io/github/stars/yourusername/privascore)
![GitHub forks](https://img.shields.io/github/forks/yourusername/privascore)
![GitHub issues](https://img.shields.io/github/issues/yourusername/privascore)
![License](https://img.shields.io/github/license/yourusername/privascore)

---

<div align="center">

**Built with ❤️ for the Underbanked**

*Making Credit Accessible, Privacy Preserved*

[⭐ Star us on GitHub](https://github.com/yourusername/privascore) • [🐦 Follow on Twitter](https://twitter.com/privascore) • [💬 Join Discord](https://discord.gg/privascore)

</div>