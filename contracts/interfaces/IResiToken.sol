// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IResiToken {
    event Initialized();
    event MentorAdded(address indexed mentor);
    event ProjectBuilderAdded(address indexed projectBuilder);

    error InvalidAddress(address);
}
