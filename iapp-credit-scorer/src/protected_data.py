import sys
import json
from datetime import datetime
import os
from Protected_data import getValue

def parse_csv_content(content):
    """Parse CSV content into transaction list"""
    transactions = []
    lines = content.strip().split('\n')
    
    if len(lines) < 2:
        print("⚠️ CSV has fewer than 2 lines (no data after header)")
        return transactions
    
    # Skip header row
    for line in lines[1:]:
        values = [v.strip() for v in line.split(',')]
        if len(values) >= 3:
            try:
                transactions.append({
                    'date': values[0],
                    'amount': float(values[1]),
                    'description': values[2]
                })
            except ValueError as e:
                print(f"⚠️ Skipping invalid row: {line[:50]}... Error: {e}")
                continue
    
    return transactions

def calculate_credit_score(transactions):
    """Calculate credit score from transaction history"""
    if not transactions:
        return {
            'score': 300, 
            'tier': 'NO_DATA', 
            'confidence': 0,
            'transaction_count': 0
        }
    
    # Factor 1: Payment Consistency (40 points max)
    # More positive transactions = better
    positive = [t for t in transactions if t['amount'] > 0]
    negative = [t for t in transactions if t['amount'] < 0]
    
    consistency = (len(positive) / len(transactions)) * 40 if transactions else 0
    
    # Factor 2: Income Stability (30 points max)
    # Lower variance in income = better
    if len(positive) > 1:
        avg = sum(t['amount'] for t in positive) / len(positive)
        variance = sum((t['amount'] - avg) ** 2 for t in positive) / len(positive)
        std = variance ** 0.5
        cv = (std / avg * 100) if avg > 0 else 100  # Coefficient of variation
        stability = max(0, 30 - (cv * 0.3))
    else:
        stability = 0
    
    # Factor 3: Debt-to-Income Ratio (30 points max)
    # Lower expenses relative to income = better
    total_income = sum(t['amount'] for t in positive)
    total_expense = abs(sum(t['amount'] for t in negative))
    
    if total_income > 0:
        debt_ratio = total_expense / total_income
        debt_score = max(0, 30 - (debt_ratio * 30))
    else:
        debt_score = 0
    
    # Calculate final score (300-850 range)
    raw_score = consistency + stability + debt_score
    final_score = int(300 + (raw_score * 5.5))
    final_score = min(850, max(300, final_score))
    
    # Determine tier
    if final_score >= 750:
        tier = 'EXCELLENT'
    elif final_score >= 700:
        tier = 'GOOD'
    elif final_score >= 650:
        tier = 'FAIR'
    elif final_score >= 600:
        tier = 'POOR'
    else:
        tier = 'VERY_POOR'
    
    # Confidence based on data quantity
    confidence = min(100, len(transactions) * 2)
    
    return {
        'score': final_score,
        'tier': tier,
        'confidence': confidence,
        'transaction_count': len(transactions),
        'factors': {
            'consistency': round(consistency, 2),
            'stability': round(stability, 2),
            'debt_score': round(debt_score, 2)
        }
    }

def write_result(result):
    """Write result in iExec-compatible format"""
    output = {
        'deterministic-output-path': '/iexec_out/result.txt',
        'callback-data': json.dumps(result)
    }
    
    # Write computed.json (required by iExec)
    with open('/iexec_out/computed.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    # Write result.txt (actual result data)
    with open('/iexec_out/result.txt', 'w') as f:
        f.write(json.dumps(result, indent=2))
    
    print(f"✅ Results written to /iexec_out/")

def main():
    print("=" * 60)
    print("🔒 PRIVASCORE TEE CREDIT SCORER")
    print("=" * 60)
    
    try:
        # Step 1: Get protected data using the deserializer
        print("\n📦 Step 1: Retrieving protected data from TEE...")
        
        try:
            # Get the file bytes from protected data
            # The 'file' key matches what the frontend sends: { file: fileBuffer }
            file_bytes = getValue('file', schema='')
            print(f"✅ Retrieved {len(file_bytes)} bytes from protected data")
            
        except Exception as e:
            print(f"❌ Failed to retrieve protected data: {e}")
            result = {
                'error': 'Failed to retrieve protected data',
                'details': str(e),
                'score': 300,
                'tier': 'ERROR'
            }
            write_result(result)
            return 1
        
        # Step 2: Decode bytes to text
        print("\n📝 Step 2: Decoding file content...")
        
        try:
            # Try UTF-8 first
            content = file_bytes.decode('utf-8')
            print(f"✅ Decoded as UTF-8")
        except UnicodeDecodeError:
            try:
                # Fallback to latin-1
                content = file_bytes.decode('latin-1')
                print(f"✅ Decoded as Latin-1")
            except Exception as e:
                print(f"❌ Failed to decode file: {e}")
                result = {
                    'error': 'Failed to decode file content',
                    'details': str(e),
                    'score': 300,
                    'tier': 'ERROR'
                }
                write_result(result)
                return 1
        
        print(f"📄 Content length: {len(content)} characters")
        print(f"📄 First 200 chars:\n{content[:200]}")
        
        # Step 3: Parse CSV content
        print("\n🔍 Step 3: Parsing CSV transactions...")
        
        transactions = parse_csv_content(content)
        print(f"✅ Parsed {len(transactions)} transactions")
        
        if not transactions:
            print("❌ No valid transactions found in CSV")
            result = {
                'error': 'No valid transactions found',
                'score': 300,
                'tier': 'NO_DATA',
                'confidence': 0
            }
            write_result(result)
            return 1
        
        # Show sample transactions
        print(f"\n📊 Sample transactions:")
        for i, t in enumerate(transactions[:3]):
            print(f"  {i+1}. {t['date']}: ${t['amount']:.2f} - {t['description'][:30]}")
        
        # Step 4: Calculate credit score
        print("\n🧮 Step 4: Calculating credit score...")
        
        result = calculate_credit_score(transactions)
        result['timestamp'] = datetime.now().isoformat()
        result['processed_in_tee'] = True
        
        print(f"\n{'=' * 60}")
        print(f"🎯 CREDIT SCORE RESULT")
        print(f"{'=' * 60}")
        print(f"Score: {result['score']}/850")
        print(f"Tier: {result['tier']}")
        print(f"Confidence: {result['confidence']}%")
        print(f"Transactions Analyzed: {result['transaction_count']}")
        print(f"{'=' * 60}")
        
        # Step 5: Write result
        print("\n💾 Step 5: Writing result...")
        write_result(result)
        
        print("\n✅ Processing complete!")
        return 0
        
    except Exception as e:
        import traceback
        print(f"\n❌ UNEXPECTED ERROR: {e}")
        print(traceback.format_exc())
        
        result = {
            'error': 'Unexpected error during processing',
            'details': str(e),
            'score': 300,
            'tier': 'ERROR'
        }
        write_result(result)
        return 1

if __name__ == "__main__":
    sys.exit(main())