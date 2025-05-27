const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MessageChain", function () {
  let MessageChain, messageChain, owner, addr1, addr2;

  beforeEach(async function () {
    MessageChain = await ethers.getContractFactory("MessageChain");
    [owner, addr1, addr2] = await ethers.getSigners();
    messageChain = await MessageChain.deploy();
  });

  it("should initialize with the first keyword", async function () {
    const messagesCount = await messageChain.getMessagesCount();
    expect(messagesCount).to.equal(1);

    const firstMessage = await messageChain.messages(0);
    expect(firstMessage.keyword).to.equal("initialKeyword");
    expect(firstMessage.author).to.equal("0x0000000000000000000000000000000000000000");
  });

  it("should allow adding a valid message", async function () {
    const newMessage = "Hello world initialKeyword";
    await messageChain.connect(addr1).addMessage(newMessage);

    const messagesCount = await messageChain.getMessagesCount();
    expect(messagesCount).to.equal(2);

    const lastMessage = await messageChain.messages(1);
    expect(lastMessage.keyword).to.equal("initialKeyword");
    expect(lastMessage.author).to.equal(addr1.address);
  });

  it("should revert when adding a message with invalid keyword characters", async function () {
    const invalidMessage = "This ends in #invalid!";
    await expect(
      messageChain.connect(addr1).addMessage(invalidMessage)
    ).to.be.revertedWithCustomError(messageChain, "InvalidCharacters");
  });

  it("should search for messages containing a specific keyword", async function () {
    await messageChain.connect(addr1).addMessage("First msg initialKeyword");
    await messageChain.connect(addr2).addMessage("Second msg initialKeyword");

    const results = await messageChain.searchMessagesByKeyword("initialKeyword");
    expect(results.length).to.equal(3); // includes constructor message
    results.forEach(msg => {
      expect(msg.keyword).to.equal("initialKeyword");
    });
  });

  it("should revert when adding a message with an empty text", async function () {
    await expect(
      messageChain.connect(addr1).addMessage("")
    ).to.be.revertedWithCustomError(messageChain, "EmptyText");
  });

  it("should revert when adding a message exceeding max length", async function () {
    const longMessage = "a".repeat(257);
    await expect(
      messageChain.connect(addr1).addMessage(longMessage)
    ).to.be.revertedWithCustomError(messageChain, "TextTooLong");
  });

  it("should validate keywords correctly", async function () {
    expect(await messageChain.isValidKeyword("valid123")).to.be.true;
    expect(await messageChain.isValidKeyword("invalid keyword")).to.be.false;
    expect(await messageChain.isValidKeyword("")).to.be.false;
  });

  it("should retrieve messages in a paginated manner", async function () {
    await messageChain.connect(addr1).addMessage("Message A initialKeyword");
    await messageChain.connect(addr2).addMessage("Message B initialKeyword");

    const msgs = await messageChain.getMessages(0, 2);
    expect(msgs.length).to.equal(2);
    msgs.forEach(msg => {
      expect(msg.keyword).to.equal("initialKeyword");
    });
  });

  it("should revert when retrieving out-of-range messages", async function () {
    await expect(
      messageChain.getMessages(10, 5)
    ).to.be.revertedWithCustomError(messageChain, "OutOfRange");
  });

  it("should retrieve the last message", async function () {
    await messageChain.connect(addr1).addMessage("Last one initialKeyword");
    const last = await messageChain.getLastMessage();
    expect(last.keyword).to.equal("initialKeyword");
    expect(last.author).to.equal(addr1.address);
  });

  it("should emit event when message is added", async function () {
    const newMessage = "Emit test initialKeyword";
    await expect(messageChain.connect(addr1).addMessage(newMessage))
      .to.emit(messageChain, "MessageAdded")
      .withArgs(addr1.address, newMessage, "initialKeyword");
  });

});
