// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IResiRegistry {
    struct Serie {
        bool active;
        bool created;
        address vault;
        uint40 startDate;
        uint40 endDate;
        uint128 currentProjects;
        uint128 numberOfProjects;
        uint256 currentSupply;
        uint256 maxSupply;
    }

    struct Project {
        uint256 serie;
        bool active;
    }

    function createSerie(
        uint40 startDate,
        uint40 endDate,
        uint128 numberOfProjects,
        uint256 maxSupply,
        address vault
    ) external;

    function addProject(bytes32 name) external;

    function addProjects(bytes32[] memory names) external;

    function disableProject(bytes32 name) external;

    function increaseSerieSupply(uint256 serieId, uint256 amount) external;

    function decreaseSerieSupply(uint256 serieId, uint256 amount) external;

    function closeSerie() external;

    function activeSerieId() external view returns (uint256 id);

    function isValidProject(uint256 serie, bytes32 project) external view returns (bool);

    function isValidProject(bytes32 project) external view returns (bool);

    function getActiveSBTSerie() external view returns (address);

    function getSerieState(uint256 serieId) external view returns (bool, uint256);

    function getSerieSupply(uint256 serieId) external view returns (uint256);

    function seriesSBTs(uint256 serieId) external view returns (address);

    function treasuryVault() external view returns (address);

    function withdrawFromVault(uint256 serieId, uint256 amount, address to) external;

    /// @notice Emitted when the Registry is initialized.
    event RegistryInitialized();

    /// @notice Emitted when Resi Token Contract is set on Contract
    /// @param resiToken Resi Token address
    event ResiTokenSet(address indexed resiToken);

    /// @notice Emitted when Treasury Vault address is set on Contract
    /// @param treasuryVault Treasury Vault address
    event TreasuryVaultSet(address indexed treasuryVault);

    event SerieSBTSet(uint256 activeSerieId, address indexed sbt);

    event SerieCreated(
        uint256 serieId,
        uint256 startDate,
        uint256 endDate,
        uint256 numberOfProjects,
        uint256 maxSupply,
        address indexed vault
    );

    event SerieSupplyUpdated(uint256 oldSupply, uint256 newSupply);

    event SerieClosed(uint256 serieId);

    event ProjectAdded(bytes32 name, uint256 serieId);

    event ProjectDisabled(bytes32 name);

    event WithdrawFromVault(uint256 serieId, uint256 amount, address indexed to);
}
