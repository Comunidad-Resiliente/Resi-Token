// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./interfaces/IResiSBT.sol";
import "./interfaces/IERC5192.sol";

contract ResiSBT is IResiSBT, IERC5192, OwnableUpgradeable, ERC721URIStorageUpgradeable {
    using Counters for Counters.Counter;

    /// @dev ContractUri
    string public contractUri;
    uint256 public serieId;

    mapping(uint256 => bool) private availableToMint;
    mapping(address => uint256) private resiTokenBalances;

    bytes32 private constant TYPEHASH = keccak256("MintRequest(address to,string uri,uint256 tokenId)");

    function initialize(string memory _name, string memory _symbol, uint256 _serieId) external initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        __ERC721_init_unchained(_name, _symbol);
        __ERC721URIStorage_init_unchained();

        emit Initialized(_name, _symbol);
    }

    /// @notice Modify contractUri for NFT collection
    /// @param _contractUri contractUri
    function setContractURI(string memory _contractUri) external onlyOwner {
        contractUri = _contractUri;
        emit ContractURIUpdated(contractUri);
    }

    /// @custom:notice The following function is override required by Solidity.
    function tokenURI(uint256 tokenId) public view override(ERC721URIStorageUpgradeable) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function mint() external {}

    function mintBatch() external {}

    function lazyMint() external {}

    function lazyMintBatch() external {}

    function claim() external {}

    function locked(uint256 tokenId) external view returns (bool) {}

    /**
     * @dev See {ERC721-_beforeTokenTransfer}.
     */
    function _beforeTokenTransfer(address from, address to, uint256 firstTokenId, uint256 batchSize) internal override {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }

    function transferFrom(address, address, uint256) public override {
        revert TransferForbidden("NO TRANSFER FROM ALLOWED");
    }

    function safeTransferFrom(address, address, uint256) public override {
        revert TransferForbidden("NO TRANSFER FROM ALLOWED");
    }

    function safeTransferFrom(address, address, uint256, bytes memory data) public override {
        revert TransferForbidden("NO TRANSFER FROM ALLOWED");
    }
}
