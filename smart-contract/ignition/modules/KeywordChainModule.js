const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("KeywordChainModule", (m) => {
  const messageChain = m.contract("MessageChain");

  return { messageChain };
});