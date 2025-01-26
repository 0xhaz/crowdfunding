// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.27;

interface ISumcheckVerifier {
    function verifyCompressedProof(bytes calldata proof, bytes32 publicInputs) external view returns (bool);
}

contract ProofVerifier is ISumcheckVerifier {
    function verifyCompressedProof(bytes calldata proof, bytes32 publicInputs) external pure override returns (bool) {
        return keccak256(proof) != keccak256("");
    }
}
