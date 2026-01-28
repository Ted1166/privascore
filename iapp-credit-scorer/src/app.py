import sys
import json
from datetime import datetime
import os
import zipfile

def parse_csv_content(content):
    transactions = []
    lines = content.strip().split('\n')
    if len(lines) < 2:
        return transactions
    
    for line in lines[1:]:
        values = [v.strip() for v in line.split(',')]
        if len(values) >= 3:
            try:
                transactions.append({
                    'date': values[0],
                    'amount': float(values[1]),
                    'description': values[2]
                })
            except ValueError:
                continue
    return transactions

def calculate_credit_score(transactions):
    if not transactions:
        return {'score': 300, 'tier': 'NO_DATA', 'confidence': 0}
    
    positive = [t for t in transactions if t['amount'] > 0]
    negative = [t for t in transactions if t['amount'] < 0]
    
    consistency = (len(positive) / len(transactions)) * 40 if transactions else 0
    
    if len(positive) > 1:
        avg = sum(t['amount'] for t in positive) / len(positive)
        variance = sum((t['amount'] - avg) ** 2 for t in positive) / len(positive)
        std = variance ** 0.5
        cv = (std / avg * 100) if avg > 0 else 100
        stability = max(0, 30 - (cv * 0.3))
    else:
        stability = 0
    
    total_income = sum(t['amount'] for t in positive)
    total_expense = abs(sum(t['amount'] for t in negative))
    debt_score = max(0, 30 - ((total_expense / total_income * 30) if total_income > 0 else 30))
    
    raw_score = consistency + stability + debt_score
    final_score = int(300 + (raw_score * 5.5))
    final_score = min(850, max(300, final_score))
    
    tier = 'EXCELLENT' if final_score >= 750 else 'GOOD' if final_score >= 700 else 'FAIR' if final_score >= 650 else 'POOR' if final_score >= 600 else 'VERY_POOR'
    
    return {
        'score': final_score,
        'tier': tier,
        'confidence': min(100, len(transactions) * 2),
        'transaction_count': len(transactions)
    }

def write_result(result):
    output = {
        'deterministic-output-path': '/iexec_out/result.txt',
        'callback-data': json.dumps(result)
    }
    
    with open('/iexec_out/computed.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    with open('/iexec_out/result.txt', 'w') as f:
        f.write(json.dumps(result, indent=2))

def main():
    input_dir = '/iexec_in'
    
    if not os.path.exists(input_dir):
        result = {'error': 'No input dir', 'score': 300, 'tier': 'ERROR'}
        write_result(result)
        return 1
    
    files = os.listdir(input_dir)
    print(f"Files: {files}")
    
    if not files:
        result = {'error': 'No input file', 'score': 300, 'tier': 'ERROR'}
        write_result(result)
        return 1
    
    input_file = os.path.join(input_dir, files[0])
    
    try:
        # Read raw bytes first
        with open(input_file, 'rb') as f:
            raw_data = f.read()
        
        print(f"File size: {len(raw_data)} bytes")
        print(f"First 50 bytes: {raw_data[:50]}")
        
        content = None
        
        # Try as ZIP
        if raw_data.startswith(b'PK'):
            print("Detected ZIP file")
            try:
                with zipfile.ZipFile(input_file, 'r') as zip_ref:
                    print(f"ZIP contents: {zip_ref.namelist()}")
                    csv_files = [f for f in zip_ref.namelist() if f.endswith('.csv') or 'csv' in f.lower()]
                    if csv_files:
                        with zip_ref.open(csv_files[0]) as f:
                            content = f.read().decode('utf-8')
                            print(f"Extracted {csv_files[0]}")
            except Exception as e:
                print(f"ZIP extraction failed: {e}")
        
        # Try as plain text
        if not content:
            print("Trying as plain text")
            try:
                content = raw_data.decode('utf-8')
            except:
                try:
                    content = raw_data.decode('latin-1')
                except Exception as e:
                    print(f"Text decode failed: {e}")
        
        if not content:
            raise Exception("Could not decode file content")
        
        print(f"Content length: {len(content)}")
        print(f"First 200 chars: {content[:200]}")
        
        transactions = parse_csv_content(content)
        print(f"Parsed {len(transactions)} transactions")
        
        if not transactions:
            raise Exception("No transactions parsed")
        
        result = calculate_credit_score(transactions)
        result['timestamp'] = datetime.now().isoformat()
        
        write_result(result)
        print(f"✓ Score: {result['score']} ({result['tier']})")
        return 0
        
    except Exception as e:
        import traceback
        result = {'error': str(e), 'score': 300, 'tier': 'ERROR'}
        print(f"Error: {e}")
        print(traceback.format_exc())
        write_result(result)
        return 1

if __name__ == "__main__":
    sys.exit(main())