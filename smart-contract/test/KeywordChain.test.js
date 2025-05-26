const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MessageChain", function () {
  let MessageChain, messageChain, owner, addr1, addr2;

  beforeEach(async function () {
    MessageChain = await ethers.getContractFactory("MessageChain");
    [owner, addr1, addr2] = await ethers.getSigners();
    messageChain = await MessageChain.deploy("initialKeyword");
  });

  it("should initialize with the first keyword", async function () {
    const messagesCount = await messageChain.getMessagesCount();
    expect(messagesCount).to.equal(1);

    const firstMessage = await messageChain.messages(0);
    expect(firstMessage.text).to.equal("Chain start");
    expect(firstMessage.keyword).to.equal("initialKeyword");
  });

  it("should allow adding a valid message", async function () {
    const newMessage = "This is a valid message with initialKeyword";
    await messageChain.connect(addr1).addMessage(newMessage);

    const messagesCount = await messageChain.getMessagesCount();
    expect(messagesCount).to.equal(2);

    const lastMessage = await messageChain.messages(1);
    expect(lastMessage.text).to.equal(newMessage);
    expect(lastMessage.keyword).to.equal("initialKeyword");
    expect(lastMessage.author).to.equal(addr1.address);
  });

  it("should revert when adding a message without the required keyword", async function () {
    await expect(
      messageChain.connect(addr1).addMessage("This message does not contain the keyword")
    ).to.be.revertedWithCustomError(messageChain, "InvalidKeyword");
  });

  it("should revert when adding a message with an empty text", async function () {
    await expect(
      messageChain.connect(addr1).addMessage("")
    ).to.be.revertedWithCustomError(messageChain, "EmptyText");
  });

  it("should revert when adding a message with text exceeding the maximum length", async function () {
    const longMessage = "a".repeat(257); // 257 characters
    await expect(
      messageChain.connect(addr1).addMessage(longMessage)
    ).to.be.revertedWithCustomError(messageChain, "TextTooLong");
  });

  it("should validate keywords correctly", async function () {
    expect(await messageChain.isValidKeyword("validKeyword123")).to.be.true;
    expect(await messageChain.isValidKeyword("invalid keyword!")).to.be.false;
    expect(await messageChain.isValidKeyword("")).to.be.false;
  });

  it("should retrieve messages in a paginated manner", async function () {
    await messageChain.connect(addr1).addMessage("Message 1 with initialKeyword");
    await messageChain.connect(addr2).addMessage("Message 2 with initialKeyword");

    const paginatedMessages = await messageChain.getMessages(0, 2);
    expect(paginatedMessages.length).to.equal(2);
    expect(paginatedMessages[0].text).to.equal("Chain start");
    expect(paginatedMessages[1].text).to.equal("Message 1 with initialKeyword");
  });

  it("should revert when retrieving messages with an invalid range", async function () {
    await expect(messageChain.getMessages(10, 5)).to.be.revertedWithCustomError(messageChain, "OutOfRange");
  });

  it("should search for messages containing a specific keyword", async function () {
    await messageChain.connect(addr1).addMessage("Message 1 with initialKeyword");
    await messageChain.connect(addr2).addMessage("Message 2 with initialKeyword");

    const searchResults = await messageChain.searchMessagesByKeyword("initialKeyword");
    expect(searchResults.length).to.equal(2);
    expect(searchResults[0].text).to.equal("Message 1 with initialKeyword");
    expect(searchResults[1].text).to.equal("Message 2 with initialKeyword");
  });

  it("should revert when searching with an invalid keyword", async function () {
    await expect(
      messageChain.searchMessagesByKeyword("invalid keyword!")
    ).to.be.revertedWithCustomError(messageChain, "InvalidCharacters");
  });

  it("should retrieve the last message in the chain", async function () {
    await messageChain.connect(addr1).addMessage("Message 1 with initialKeyword");
    await messageChain.connect(addr2).addMessage("Message 2 with initialKeyword");

    const lastMessage = await messageChain.getLastMessage();
    expect(lastMessage.text).to.equal("Message 2 with initialKeyword");
    expect(lastMessage.author).to.equal(addr2.address);
  });
});