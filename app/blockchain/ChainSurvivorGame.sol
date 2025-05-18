// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract ChainSurvivorGame {
    struct PlayerData {
        uint256 coins;
        uint256 level;
        uint256 maxHp;
        uint256 attackPower;
        // 可扩展更多属性
    }

    mapping(address => PlayerData) private players;

    event PlayerDataUpdated(address indexed player, PlayerData data);

    // 读取玩家数据
    function getPlayerData(address player) external view returns (
        uint256 coins,
        uint256 level,
        uint256 maxHp,
        uint256 attackPower
    ) {
        PlayerData storage data = players[player];
        return (data.coins, data.level, data.maxHp, data.attackPower);
    }

    // 写入/更新玩家数据（仅允许自己操作）
    function setPlayerData(
        uint256 coins,
        uint256 level,
        uint256 maxHp,
        uint256 attackPower
    ) external {
        PlayerData storage data = players[msg.sender];
        data.coins = coins;
        data.level = level;
        data.maxHp = maxHp;
        data.attackPower = attackPower;
        emit PlayerDataUpdated(msg.sender, data);
    }

    // 可选：初始化玩家（如首次登录奖励等）
    function initPlayer() external {
        require(players[msg.sender].level == 0, "Already initialized");
        players[msg.sender] = PlayerData({
            coins: 0,
            level: 1,
            maxHp: 100,
            attackPower: 10
        });
        emit PlayerDataUpdated(msg.sender, players[msg.sender]);
    }
} 