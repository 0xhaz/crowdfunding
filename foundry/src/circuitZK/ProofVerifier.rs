use plonky2::field::goldilocks_field::GoldilocksField;
use plonky2::plonk::circuit_builder::CircuitBuilder;
use plonky2::plonk::config::{PoseidonGoldilocksConfig, GenericConfig};
use plonky2::plonk::proof::ProofWithPublicInputs;
use plonky2::util::serialization::{Buffer, IoResult};

type F = GoldilocksField;
type C = PoseidonGoldilocksConfig;
const D: usize = 2;

fn generate_proof(amount: u64, campaign_id: u64) -> IoResult<()> {}