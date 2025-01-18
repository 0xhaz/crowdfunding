#!/bin/bash
echo "Generating proof..."
cd rust
cargo run
echo "Proof generated."

echo "Submitting proof to smart contract..."
node ../scripts/submit_proof.js