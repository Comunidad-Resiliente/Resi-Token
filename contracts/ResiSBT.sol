// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./interfaces/IResiSBT.sol";
import "./interfaces/IResiRegistry.sol";
import "./interfaces/IResiToken.sol";
import "./interfaces/IERC5192.sol";

contract ResiSBT is IResiSBT, IERC5192, OwnableUpgradeable, ERC721URIStorageUpgradeable {
    using Counters for Counters.Counter;
    /// @dev Private counter to make internal security checks
    Counters.Counter private _tokenIdCounter;

    /// @dev ContractUri
    string public contractUri;
    uint256 public SERIE_ID;
    address public RESI_TOKEN;
    address public RESI_REGISTRY;

    mapping(address => bytes32) public userNickNames;
    mapping(address => uint256) private resiTokenBalances;
    mapping(uint256 => bool) private lockedSBTs;
    mapping(bytes32 => string) private defaultRoleUris;

    function initialize(
        string memory _name,
        string memory _symbol,
        string memory _contractUri,
        uint256 _serieId,
        address _registry,
        address _token
    ) external initializer {
        require(_registry != address(0), "INVALID REGISTRY ADDRESS");
        require(_token != address(0), "INVALID RESI TOKEN ADDRESS");
        __Context_init_unchained();
        __Ownable_init_unchained();
        __ERC721_init_unchained(_name, _symbol);
        __ERC721URIStorage_init_unchained();

        RESI_REGISTRY = _registry;
        RESI_TOKEN = _token;
        SERIE_ID = _serieId;
        contractUri = _contractUri;

        emit ResiSBTInitialized(_name, _symbol, _serieId, _registry, _token);
    }

    /// @notice Modify contractUri for NFT collection
    /// @param _contractUri contractUri
    function setContractURI(string memory _contractUri) external onlyOwner {
        contractUri = _contractUri;
        emit ContractURIUpdated(contractUri);
    }

    function setRegistry(address _registry) external onlyOwner {
        require(_registry != address(0), "INVALID REGISTRY ADDRESS");
        RESI_REGISTRY = _registry;
        emit RegistrySet(_registry);
    }

    function setDefaultRoleUri(bytes32 _role, string calldata _uri) external onlyOwner {
        require(_role != bytes32(0), "ResiSBT: INVALID ROLE");
        require(bytes(_uri).length > 0, "RESISBT: Empty URI");
        string memory oldUri = defaultRoleUris[_role];
        defaultRoleUris[_role] = _uri;
        emit DefaultRoleUriUpdated(oldUri, _uri);
    }

    /// @custom:notice The following function is override required by Solidity.
    function tokenURI(uint256 tokenId) public view override(ERC721URIStorageUpgradeable) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function mint(address _to, bytes32 _role, string memory _uri) external onlyOwner returns (uint256) {
        uint256 tokenId = _mintSBT(_to, _role, _uri);
        emit MintSBT(_to, _role, tokenId);
        return tokenId;
    }

    function mintBatchByRole(address[] memory _to, string memory _uri, bytes32 _role) external onlyOwner {
        for (uint256 i = 0; i < _to.length; i++) {
            _checkMint(_to[i], _role, _uri);
            _mintSBT(_to[i], _role, _uri);
        }
    }

    function mintByResiToken(address _to, bytes32 _role) external onlyResiToken {
        string memory defaultUri = defaultRoleUris[_role];
        require(bytes(defaultUri).length > 0, "Default Role Uri not set");
        uint256 tokenId = _mintSBT(_to, _role, defaultUri);
        emit SBTMintedByResiToken(_to, _role, tokenId);
    }

    function increaseResiTokenBalance(address _to, uint256 _amount) external onlyResiToken {
        require(balanceOf(_to) == 1, "ResiSBT: User has no SBT");
        require(_amount > 0, "ResiSBT: Invalid amount");
        resiTokenBalances[_to] += _amount;
        emit IncreaseResiBalance(_to, _amount);
    }

    function decreaseResiTokenBalance(address _to, uint256 _amount) external onlyResiToken {
        require(balanceOf(_to) == 1, "ResiSBT: User has no SBT");
        require(_amount > 0, "ResiSBT: Invalid amount");
        resiTokenBalances[_to] -= _amount;
        emit DecreaseResiBalance(_to, _amount);
    }

    function _mintSBT(address _to, bytes32 _role, string memory _uri) internal onlyOwner returns (uint256) {
        _checkMint(_to, _role, _uri);
        uint256 _tokenId = _tokenIdCounter.current();

        //mint sbt
        lockedSBTs[_tokenId] = true;
        _safeMint(_to, _tokenId);
        super._setTokenURI(_tokenId, _uri);

        _tokenIdCounter.increment();

        emit Locked(_tokenId);
        return _tokenId;
    }

    function locked(uint256 tokenId) external view returns (bool) {
        return lockedSBTs[tokenId];
    }

    function _checkMint(address _to, bytes32 _role, string memory uri) internal view onlyOwner {
        require(_to != address(0), "ResiSBT: INVALID TO ADDRESS");
        require(balanceOf(_to) == 0, "ResiSBT: USER ALREADY HAS SBT");
        require(bytes(uri).length > 0, "ResiSBT: EMPTY URI");
        require(IResiToken(RESI_TOKEN).isSBTReceiver(_to, _role, SERIE_ID), "ResiSBT: INVALID SBT RECEIVER");
    }

    /**
     * @dev See {ERC721-_beforeTokenTransfer}.
     */
    function _beforeTokenTransfer(address from, address to, uint256 firstTokenId, uint256 batchSize) internal override {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }

    function transferFrom(address, address, uint256) public pure override {
        revert TransferForbidden("ResiSBT: NO TRANSFER FROM ALLOWED");
    }

    function safeTransferFrom(address, address, uint256) public pure override {
        revert TransferForbidden("ResiSBT: NO TRANSFER FROM ALLOWED");
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert TransferForbidden("ResiSBT: NO TRANSFER FROM ALLOWED");
    }

    modifier onlyRegistry() {
        require(_msgSender() == RESI_REGISTRY, "INVALID REGISTRY ADDRESS");
        _;
    }

    modifier onlyResiToken() {
        require(_msgSender() == RESI_TOKEN, "INVALID RESI TOKEN ADDRESS");
        _;
    }
}
