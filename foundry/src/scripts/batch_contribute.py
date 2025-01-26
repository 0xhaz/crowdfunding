import hashlib
import json

class Contribution:
    def __init__(self, amount, campaign_id):
        self.amount = amount
        self.campaign_id = campaign_id

    def to_dict(self):
        return {"amount": self.amount, "campaign_id": self.campaign_id}

# def hash_contributions(contributions):
#     """
#     Create a deterministic public input hash by hashing all contributions
#     """
#     data = json.dumps([c.to_dict() for c in contributions], sort_keys=True).encode()
#     return hashlib.sha256(data).hexdigest()

# Simulating multiple contributions
contributions = [
    Contribution(amount=1_000_000_000_000_000_000, campaign_id=0), # 1e18 wei
    Contribution(amount=500_000_000_000_000_000, campaign_id=0), # 5e17 wei
]

# Compute total contribution amount
total_contribution = sum(c.amount for c in contributions)

# Encode total contribution as a 32-byte value (big-endian)
public_input_hash = f"0x{total_contribution.to_bytes(32, 'big').hex()}"

# Compute aggregated proof (mocked for now)
aggregated_proof = "0x" + hashlib.sha256(b"fake_proof").hexdigest() 

# Print results
print("Aggregated proof:", aggregated_proof)    
print("Public input hash:", public_input_hash)
print("Total contribution:", total_contribution)