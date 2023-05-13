// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./interfaces/IResiVault.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ResiVault is IResiVault, OwnableUpgradeable {
    address public TOKEN;
    address public RESI_TOKEN;
    uint256 public SERIE_ID;

    mapping(bytes32 => address) public tokens;

    function initialize(uint256 _serieId, address _token, address _resiToken) public initializer {
        require(_token != address(0), "INVALID TOKEN ADDRESS");
        require(_resiToken != address(0), "INVALID RESI TOKEN ADDRESS");
        __Context_init_unchained();
        __Ownable_init_unchained();
        SERIE_ID = _serieId;
        TOKEN = _token;
        RESI_TOKEN = _resiToken;
        emit Initialized(_serieId, _token, _resiToken);
    }

    function tokenBalance() external view returns (uint256) {
        return IERC20(TOKEN).balanceOf(address(this));
    }

    function tokenBalance(bytes32 _name) external view returns (uint256) {
        require(tokens[_name] != address(0), "INVALID TOKEN NAME");
        return IERC20(tokens[_name]).balanceOf(address(this));
    }

    function balance() external view returns (uint256) {
        return address(this).balance;
    }

    function addToken(address _token, bytes32 _name) external onlyOwner {
        require(_token != address(0), "INVALID TOKEN ADDRESS");
        require(_name != bytes32(0), "INVALID NAME");
        require(tokens[_name] == address(0), "TOKEN ALREADY SET");
        tokens[_name] = _token;
        emit TokenAdded(_name, _token);
    }

    function removeToken(bytes32 _name) external onlyOwner {
        require(tokens[_name] != address(0), "INVALID TOKEN NAME");
        address _token = tokens[_name];
        tokens[_name] = address(0);
        emit TokenRemoved(_name, _token);
    }

    // function release() external {}

    // function release() external onlyResiRegistry {}

    receive() external payable {
        emit EtherReceived(_msgSender(), msg.value);
    }

    // Leave a gap betweeen inherited contracts variables in order
    // to be able to add more variables in them later.
    uint256[20] private upgradeGap;
}
