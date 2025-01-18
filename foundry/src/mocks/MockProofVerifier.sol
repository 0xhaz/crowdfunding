// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.27;

import {IStarkVerifier, ProofVerifier} from "src/circuitZK/ProofVerifier.sol";

contract MockProofVerifier is IStarkVerifier {
    function verifyStarkProof(bytes calldata, /*proof*/ bytes32 /*publicInputs*/ ) external pure returns (bool) {
        return true;
    }
}
