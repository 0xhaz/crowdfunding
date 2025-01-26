import hashlib
import json

def generate_zklogin_proof(email, timestamp):
    """
    Generates a mock zkLogin proof for authentication
    """
    proof_data = json.dumps({"email": email, "timestamp": timestamp}, sort_keys=True).encode()
    proof_hash = hashlib.sha256(proof_data).hexdigest()
    return f"0x{proof_hash}"

# Simulating a user login
email = "user@example.com"
timestamp = 1700000000 # Unix timestamp
zk_login_proof = generate_zklogin_proof(email, timestamp)

print("Generated zkLogin proof:", zk_login_proof)