// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.27;

interface IZKBridge {
    function send(uint16 dstChainId, address dstAddress, bytes memory payload)
        external
        payable
        returns (uint64 nonce);

    function estimateFee(uint16 dstChainId) external view returns (uint256 fee);
}

interface IZKBridgeReceiver {
    function zkReceive(uint16 srcChainId, address srcAddress, uint64 nonce, bytes calldata payload) external;
}
