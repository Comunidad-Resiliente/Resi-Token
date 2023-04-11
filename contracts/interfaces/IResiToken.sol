// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IResiToken {
    event Initialized(address indexed treasury, address indexed registry);
    event MentorAdded(address indexed mentor);
    event ProjectBuilderAdded(address indexed projectBuilder);
    event ResiBuilderAdded(address indexed resiBuilder);
    event MentorRemoved(address indexed mentor);
    event ProjectBuilderRemoved(address indexed projectBuilder);
    event ResiBuilderRemoved(address indexed resiBuilder);

    error InvalidAddress(address);
}
