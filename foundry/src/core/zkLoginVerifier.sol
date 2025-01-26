// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.27;

/**
 * @title ZkLoginVerifier
 * @dev This contract verifies zkLogin proofs for keyless login
 */
contract zkLoginVerifier {
    event UserAuthenticated(address indexed user, bytes32 publicKey);

    /// @notice Mock zkLogin verification function
    /// @param zkProof The zero-knowledge proof submitted by the user
    /// @param publicKey The public key (or identity hash) used for authentication
    function verifyZkLogin(bytes32 zkProof, bytes32 publicKey) external pure returns (bool) {
        return zkProof != bytes32(0) && publicKey != bytes32(0);
    }
}
