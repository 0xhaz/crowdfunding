from nova import Nova, Circuit

# Define the circuit for individual contributions
class ContributionCircuit(Circuit):
    def __init__(self, amount, campaign_id, is_valid):
        self.amount = amount
        self.campaign_id = campaign_id
        self.is_valid = is_valid

    def validate(self):
        assert self.amount > 0, "Amount must be greater than 0"
        assert self.is_valid, "Contribution is not valid"

# Generate individual proofs for contributions
contributor_1 = ContributionCircuit(amount=10, campaign_id=1, is_valid=True)
contributor_2 = ContributionCircuit(amount=20, campaign_id=2, is_valid=True)

proof_1 = Nova.generate_proof(contributor_1)
proof_2 = Nova.generate_proof(contributor_2)

# Aggregate proofs using Nova
aggregated_proof = Nova.aggregate([proof_1, proof_2])

# Submit the aggregated proof to the smart contract
print(f"Aggregated Proof: {aggregated_proof}")