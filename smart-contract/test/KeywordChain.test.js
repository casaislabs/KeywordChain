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
    expect(message.keyword).to.equal("initialKeyword");
    expect(message.author).to.equal("0x0000000000000000000000000000000000000000");
  });

  it("should allow adding a valid message", async function () {
    const text = "initialKeyword Hello";
    await expect(messageChain.connect(addr1).addMessage(text))
      .to.emit(messageChain, "MessageAdded")
      .withArgs(addr1.address, text, "Hello");

    const lastMessage = await messageChain.getLastMessage();
    expect(lastMessage.keyword).to.equal("Hello");
    expect(lastMessage.author).to.equal(addr1.address);
  });

  it("should revert when adding a message with invalid keyword characters", async function () {
    const invalidText = "initialKeyword hello$";
    await expect(
      messageChain.connect(addr1).addMessage(invalidText)
    ).to.be.revertedWithCustomError(messageChain, "InvalidCharacters");
  });

  it("should revert when adding a message with an empty text", async function () {
    await expect(
      messageChain.connect(addr1).addMessage("")
    ).to.be.revertedWithCustomError(messageChain, "EmptyText");
  });

  it("should revert when adding a message exceeding max length", async function () {
    const longText = "initialKeyword " + "a".repeat(257);
    await expect(
      messageChain.connect(addr1).addMessage(longText)
    ).to.be.revertedWithCustomError(messageChain, "TextTooLong");
  });

  it("should validate keywords correctly", async function () {
    expect(await messageChain.isValidKeyword("abc123")).to.be.true;
    expect(await messageChain.isValidKeyword("abc-123")).to.be.false;
    expect(await messageChain.isValidKeyword("")).to.be.false;
  });

  it("should search for messages containing a specific keyword", async function () {
    await messageChain.connect(addr1).addMessage("initialKeyword hello");
    await messageChain.connect(addr1).addMessage("hello world");
    const messages = await messageChain.searchMessagesByKeyword("world");
    expect(messages.length).to.equal(1);
    expect(messages[0].keyword).to.equal("world");
  });

  it("should retrieve messages in a paginated manner", async function () {
    await messageChain.connect(addr1).addMessage("initialKeyword one");
    await messageChain.connect(addr1).addMessage("one two");
    await messageChain.connect(addr1).addMessage("two three");

    const paginated = await messageChain.getMessages(1, 2);
    expect(paginated.length).to.equal(2);
    expect(paginated[0].keyword).to.equal("one");
    expect(paginated[1].keyword).to.equal("two");
  });

  it("should revert when retrieving out-of-range messages", async function () {
    await expect(
      messageChain.getMessages(100, 1)
    ).to.be.revertedWithCustomError(messageChain, "OutOfRange");
  });

  it("should retrieve the last message", async function () {
    await messageChain.connect(addr1).addMessage("initialKeyword finalWord");
    const lastMessage = await messageChain.getLastMessage();
    expect(lastMessage.keyword).to.equal("finalWord");
  });

  it("should emit event when message is added", async function () {
    const text = "initialKeyword eventTest";
    await expect(messageChain.connect(addr1).addMessage(text))
      .to.emit(messageChain, "MessageAdded")
      .withArgs(addr1.address, text, "eventTest");
  });
});
