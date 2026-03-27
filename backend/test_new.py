"""Quick test of all new backend components."""
from app.api.dashboards import _compute_benford
from app.database import execute_query
from app.auth import create_token, decode_token, hash_password, verify_password

# Test fiscal
txns = execute_query("SELECT amount FROM fiscal_transactions")
amounts = [float(t["amount"]) for t in txns]
benford = _compute_benford(amounts)
print(f"Fiscal: {len(txns)} transactions, Benford MAD={benford['mad']}, chi2={benford['chi2']}")

# Test procurement
contracts = execute_query("SELECT COUNT(*) as c, AVG(cri_score) as avg_cri FROM procurement_contracts")
print(f"Procurement: {contracts[0]['c']} contracts, avg CRI={float(contracts[0]['avg_cri']):.4f}")

# Test welfare
welfare = execute_query("SELECT COUNT(*) as c FROM welfare_districts")
print(f"Welfare: {welfare[0]['c']} district records")

# Test auth
token = create_token({"sub": "admin", "role": "superadmin"})
decoded = decode_token(token)
print(f"Auth: Token created, decoded sub={decoded['sub']}, role={decoded['role']}")
print("\n✅ All systems OK!")
