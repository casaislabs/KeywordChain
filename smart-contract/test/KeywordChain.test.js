const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MessageChain", function () {
  let MessageChain, messageChain, owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    MessageChain = await ethers.getContractFactory("MessageChain");
    messageChain = await MessageChain.deploy();
  });

  it("should initialize with the first keyword", async function () {
    const message = await messageChain.getLastMessage();
    expect(message.keyword).to.equal("MessageChain"); // Corrige la palabra clave inicial
    expect(message.author).to.equal("0x0000000000000000000000000000000000000000");
  });

  it("should allow adding a valid message", async function () {
    const text = "MessageChain Hello";
    await expect(messageChain.connect(addr1).addMessage(text))
      .to.emit(messageChain, "MessageAdded")
      .withArgs(addr1.address, text, "Hello");

    const lastMessage = await messageChain.getLastMessage();
    expect(lastMessage.keyword).to.equal("Hello");
    expect(lastMessage.author).to.equal(addr1.address);
  });

  it("should search for messages containing a specific keyword", async function () {
    await messageChain.connect(addr1).addMessage("MessageChain Hello");
    await messageChain.connect(addr1).addMessage("Hello World");
    const messages = await messageChain.searchMessagesByKeyword("World");
    expect(messages.length).to.equal(1);
    expect(messages[0].keyword).to.equal("World");
  });

it("should retrieve messages in a paginated manner", async function () {
  await messageChain.connect(addr1).addMessage("MessageChain One");
  await messageChain.connect(addr1).addMessage("One Two");
  await messageChain.connect(addr1).addMessage("Two Three");

  const paginated = await messageChain.getMessages(1, 2);
  expect(paginated.length).to.equal(2);
  expect(paginated[0].keyword).to.equal("One"); // Ajustado a "One"
  expect(paginated[1].keyword).to.equal("Two"); // Ajustado a "Two"
});
  it("should retrieve the last message", async function () {
    await messageChain.connect(addr1).addMessage("MessageChain FinalWord");
    const lastMessage = await messageChain.getLastMessage();
    expect(lastMessage.keyword).to.equal("FinalWord");
  });

  it("should emit event when message is added", async function () {
    const text = "MessageChain EventTest";
    await expect(messageChain.connect(addr1).addMessage(text))
      .to.emit(messageChain, "MessageAdded")
      .withArgs(addr1.address, text, "EventTest");
  });
});