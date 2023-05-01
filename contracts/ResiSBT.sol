// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "./interfaces/IResiSBT.sol";
import "./interfaces/IERC5192.sol";

contract ResiSBT is IResiSBT, ERC721Upgradeable {}
