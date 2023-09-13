// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {IAccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/IAccessControlUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import {ERC721URIStorageUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";

import {IResiSBT} from "./interfaces/IResiSBT.sol";
import {IResiRegistry} from "./interfaces/IResiRegistry.sol";
import {IResiToken} from "./interfaces/IResiToken.sol";
import {IERC5192} from "./interfaces/IERC5192.sol";

/// @title Resi SBT Contract
/// @author Alejo Lovallo
/// @notice SBT token linked to a Serie
contract ResiSBT is IResiSBT, IERC5192, OwnableUpgradeable, ERC721URIStorageUpgradeable, ReentrancyGuardUpgradeable {
    using Counters for Counters.Counter;
    /// @dev Private counter to make internal security checks
    Counters.Counter private _tokenIdCounter;

    /// @dev Token ContractUri
    string public contractUri;
    /// @dev Serie id
    uint256 public SERIE_ID;
    /// @dev Resi ERC20 token contract
    address public RESI_TOKEN;
    /// @dev Resi Registry contract
    address public RESI_REGISTRY;

    /// @dev user => nickname
    mapping(address user => bytes32 nickname) public userNickNames;
    /// @dev user => resi erc20 balances
    mapping(address => uint256) public resiTokenBalances;
    /// @dev tokenId => isLocked
    mapping(uint256 => bool) private lockedSBTs;
    /// @dev role => uri
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
        __ReentrancyGuard_init_unchained();
        __ERC721_init_unchained(_name, _symbol);
        __ERC721URIStorage_init_unchained();

        RESI_REGISTRY = _registry;
        RESI_TOKEN = _token;
        SERIE_ID = _serieId;
        contractUri = _contractUri;

        emit ResiSBTInitialized(_name, _symbol, _serieId, _registry, _token);
    }

    /**************************** GETTERS  ****************************/
    /**
     * @dev Know if a sbt is locked
     * @param tokenId sbt token id
     * @return is sbt locked
     */
    function locked(uint256 tokenId) external view returns (bool) {
        return lockedSBTs[tokenId];
    }

    /**
     * @dev check if user is able to receive SBT
     * @param _account receiver address
     * @param _role acount role granted by ResiToken
     * @param _serieId serie where sbt belongs to
     * @return whether is sbt receiver
     */
    function isSBTReceiver(address _account, bytes32 _role, uint256 _serieId) public view returns (bool) {
        return (IAccessControlUpgradeable(RESI_TOKEN).hasRole(_role, _account) &&
            IResiRegistry(RESI_REGISTRY).activeSerieId() == _serieId);
    }

    /**************************** INTERFACE  ****************************/

    /**
     * @dev Set SBT owner nickname/username
     * @param _nickname sbt username
     */
    function setNickName(bytes32 _nickname) external {
        require(balanceOf(_msgSender()) == 1, "ResiSBT: NOT AN SBT OWNER");
        require(_nickname != bytes32(0), "ResiSBT: INVALID NICKNAME");
        userNickNames[_msgSender()] = _nickname;
        emit NicknameUpdated(_msgSender(), _nickname);
    }

    /// @notice Modify contractUri for NFT collection
    /// @param _contractUri contractUri
    function setContractURI(string memory _contractUri) external onlyOwner {
        contractUri = _contractUri;
        emit ContractURIUpdated(contractUri);
    }

    /**
     * @dev Set Resi Registry
     * @param _registry registry address
     */
    function setRegistry(address _registry) external onlyOwner {
        require(_registry != address(0), "INVALID REGISTRY ADDRESS");
        RESI_REGISTRY = _registry;
        emit RegistrySet(_registry);
    }

    /**
     * @dev Set default Resi Token Role URI
     * @param _role role name
     * @param _uri default uri
     */
    function setDefaultRoleUri(bytes32 _role, string calldata _uri) external onlyOwner {
        require(_role != bytes32(0), "ResiSBT: INVALID ROLE");
        require(bytes(_uri).length > 0, "ResiSBT: Empty URI");
        string memory oldUri = defaultRoleUris[_role];
        defaultRoleUris[_role] = _uri;
        emit DefaultRoleUriUpdated(oldUri, _uri);
    }

    /**
     * @dev Mint SBT to user with specific role and uri.
     * @param _to user
     * @param _role role name from Resi registry
     * @param _uri uri
     */
    function mint(address _to, bytes32 _role, string memory _uri) external onlyOwner returns (uint256) {
        uint256 tokenId = _mintSBT(_to, _role, _uri);
        emit MintSBT(_to, _role, tokenId);
        return tokenId;
    }

    /**
     * @dev Mint to more than one user sbts by specific role
     * @param _to array of users
     * @param _uri token uri for the sbts
     * @param _role role that all users must have
     */
    function mintBatchByRole(address[] calldata _to, string memory _uri, bytes32 _role) external onlyOwner {
        for (uint256 i = 0; i < _to.length; i++) {
            _checkMint(_to[i], _role, _uri);
            _mintSBT(_to[i], _role, _uri);
        }
    }

    /**
     * @dev Mint function performed only by ResiToken contract
     * @param _to user to mint sbt
     * @param _role user role
     */
    function mintByResiToken(address _to, bytes32 _role) external onlyResiToken nonReentrant {
        _mintByResiToken(_to, _role);
    }

    /**
     *  @dev Increase resi token balance
     * @param _to user address
     * @param _amount amount to increase
     */
    function increaseResiTokenBalance(address _to, uint256 _amount) external onlyResiToken nonReentrant {
        _increaseResiTokenBalance(_to, _amount);
    }

    /**
     * @dev Decrease resi token balance
     * @param _to user address
     * @param _amount amoutn to decrease
     */
    function decreaseResiTokenBalance(address _to, uint256 _amount) external onlyResiToken nonReentrant {
        _decreaseResiTokenBalance(_to, _amount);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721Upgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /// @notice openSea integration royalty. See https://docs.opensea.io/docs/contract-level-metadata
    function contractURI() public view returns (string memory) {
        return contractUri;
    }

    /**************************** INTERNALS  ****************************/

    /**
     * @dev Internal function to mint an sbt to a user
     * @param _to user address
     * @param _role user role
     * @param _uri sbt uri
     * @return sbt id
     */
    function _mintSBT(address _to, bytes32 _role, string memory _uri) internal returns (uint256) {
        require(_msgSender() == owner() || _msgSender() == RESI_TOKEN, "ResiSBT: ONLY OWNER OR RESI TOKEN");
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

    /**
     *  @dev Internal function to mint sbt by ResiToken contract
     * @param _to user address
     * @param _role user role
     */
    function _mintByResiToken(address _to, bytes32 _role) private {
        string memory defaultUri = defaultRoleUris[_role];
        require(bytes(defaultUri).length > 0, "ResiSBT: Default Role Uri not set");
        uint256 tokenId = _mintSBT(_to, _role, defaultUri);
        emit SBTMintedByResiToken(_to, _role, tokenId);
    }

    /**
     * @dev internal function to increase resitoken balance
     * @param _to user address
     * @param _amount amouunt to increase
     */
    function _increaseResiTokenBalance(address _to, uint256 _amount) private {
        require(balanceOf(_to) == 1, "ResiSBT: User has no SBT");
        require(_amount > 0, "ResiSBT: Invalid amount");
        resiTokenBalances[_to] += _amount;
        emit IncreaseResiBalance(_to, _amount);
    }

    /**
     *  @dev internal function to decrease resitoken balance
     * @param _to user address
     * @param _amount amount to decrease
     */
    function _decreaseResiTokenBalance(address _to, uint256 _amount) private {
        require(balanceOf(_to) == 1, "ResiSBT: User has no SBT");
        require(_amount > 0, "ResiSBT: Invalid amount");
        resiTokenBalances[_to] -= _amount;
        emit DecreaseResiBalance(_to, _amount);
    }

    /**
     *  @dev internal function to check mint conditions
     * @param _to user address
     * @param _role user role
     * @param uri sbt uri
     */
    function _checkMint(address _to, bytes32 _role, string memory uri) internal view {
        require(_msgSender() == owner() || _msgSender() == RESI_TOKEN, "ResiSBT: ONLY OWNER OR RESI TOKEN");
        require(_to != address(0), "ResiSBT: INVALID TO ADDRESS");
        require(balanceOf(_to) == 0, "ResiSBT: USER ALREADY HAS SBT");
        require(bytes(uri).length > 0, "ResiSBT: EMPTY URI");
        require(isSBTReceiver(_to, _role, SERIE_ID), "ResiSBT: INVALID SBT RECEIVER");
    }

    /**
     * @dev See {ERC721-_beforeTokenTransfer}.
     */
    function _beforeTokenTransfer(address from, address to, uint256 firstTokenId, uint256 batchSize) internal override {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }

    /**
     *
     *  @dev Transfer from is forbidden in SBT contract
     */
    function _transfer(address, address, uint256) internal pure override {
        revert TransferForbidden("ResiSBT: NO TRANSFER FROM ALLOWED");
    }

    /**
     * @dev Modifier to perform actions only by ResiToken contract
     */
    modifier onlyResiToken() {
        require(_msgSender() == RESI_TOKEN, "ResiSBT: INVALID RESI TOKEN ADDRESS");
        _;
    }

    /// @dev Leave a gap betweeen inherited contracts variables in order
    /// @dev to be able to add more variables in them later.
    uint256[20] private upgradeGap;
}
