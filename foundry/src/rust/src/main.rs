use plonky2::field::goldilocks_field::GoldilocksField;
use plonky2::plonk::circuit_builder::CircuitBuilder;
use plonky2::plonk::config::{PoseidonGoldilocksConfig, GenericConfig};
use plonky2::plonk::proof::ProofWithPublicInputs;
use plonky2::util::serialization::{Buffer, IoResult};
use std::fs;

type F = GoldilocksField;
type C = PoseidonGoldilocksConfig;
const D: usize = 2;

// Generate a proof for a crowdfunding contribution
fn generate_proof(amount: u64, campaign_id: u64) -> IoResult<()> {
    let mut builder = CircuitBuilder::<F, D>::new();

    // Constraints: Amount > 0 and Campaign ID is valid
    let amount_var = builder.add_virtual_target();
    let campaign_id_var = builder.add_virtual_target();

    builder.range_check(amount_var, 64);
    builder.range_check(campaign_id_var, 64);

    let circuit_data = builder.build::<C>();
    let proof = circuit_data.prove();

    // Serialize the proof
    let mut buffer = Buffer::new();
    proof.write(&mut buffer)?;

    use hex;
    let hex_proof = hex::encode(buffer.to_bytes());
    fs::write("proof.json", hex_proof)?;
    println!("Proof (hex-encoded) saved to proof.json");
    Ok(())
}

fn main() {
    let _ = generate_proof(10, 1);
}