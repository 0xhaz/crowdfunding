// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.27;

import {ISumcheckVerifier, ProofVerifier} from "src/circuitZK/ProofVerifier.sol";

contract MockProofVerifier is ISumcheckVerifier {
    function verifyStarkProof(
        bytes calldata,
        /*proof*/
        bytes32 /*publicInputs*/
    ) external pure returns (bool) {
        return true;
    }

    function verifyProof(bytes calldata proof, bytes32 publicInputsHash) external pure returns (bool) {
        return true;
    }

    function verifyCompressedProof(bytes calldata proof, bytes32 publicInputs) external pure override returns (bool) {
        return true;
    }
}
