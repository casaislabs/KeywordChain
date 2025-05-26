const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("KeywordChainModule", (m) => {
  // Provide the required argument for the constructor
  const messageChain = m.contract("MessageChain", ["initialKeyword"]);

  return { messageChain };
});