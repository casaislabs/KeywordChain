const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MessageChain", function () {
  let MessageChain, messageChain, owner, addr1;

  // Setup before each test: deploy the contract and initialize signers
  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    MessageChain = await ethers.getContractFactory("MessageChain");
    messageChain = await MessageChain.deploy();
  });

  // Test: Verify the contract initializes with the first keyword
  it("should initialize with the first keyword", async function () {
    const message = await messageChain.getLastMessage();
    expect(message.keyword).to.equal("MessageChain"); // Check initial keyword
    expect(message.author).to.equal("0x0000000000000000000000000000000000000000"); // Check initial author
  });

  // Test: Ensure adding a valid message works correctly
  it("should allow adding a valid message", async function () {
    const text = "MessageChain Hello";
    await expect(messageChain.connect(addr1).addMessage(text))
      .to.emit(messageChain, "MessageAdded") // Verify event emission
      .withArgs(addr1.address, text, "Hello"); // Check event arguments

    const lastMessage = await messageChain.getLastMessage();
    expect(lastMessage.keyword).to.equal("Hello"); // Verify the new keyword
    expect(lastMessage.author).to.equal(addr1.address); // Verify the author
  });

  // Test: Ensure searching for messages by keyword works correctly
  it("should search for messages containing a specific keyword", async function () {
    await messageChain.connect(addr1).addMessage("MessageChain Hello");
    await messageChain.connect(addr1).addMessage("Hello World");
    const messages = await messageChain.searchMessagesByKeyword("World");
    expect(messages.length).to.equal(1); // Verify the number of matching messages
    expect(messages[0].keyword).to.equal("World"); // Verify the keyword of the matching message
  });

  // Test: Ensure messages can be retrieved in a paginated manner
  it("should retrieve messages in a paginated manner", async function () {
    await messageChain.connect(addr1).addMessage("MessageChain One");
    await messageChain.connect(addr1).addMessage("One Two");
    await messageChain.connect(addr1).addMessage("Two Three");

    const paginated = await messageChain.getMessages(1, 2);
    expect(paginated.length).to.equal(2); // Verify the number of retrieved messages
    expect(paginated[0].keyword).to.equal("One"); // Verify the first message's keyword
    expect(paginated[1].keyword).to.equal("Two"); // Verify the second message's keyword
  });

  // Test: Ensure the last message can be retrieved correctly
  it("should retrieve the last message", async function () {
    await messageChain.connect(addr1).addMessage("MessageChain FinalWord");
    const lastMessage = await messageChain.getLastMessage();
    expect(lastMessage.keyword).to.equal("FinalWord"); // Verify the last keyword
  });

  // Test: Ensure the MessageAdded event is emitted when a message is added
  it("should emit event when message is added", async function () {
    const text = "MessageChain EventTest";
    await expect(messageChain.connect(addr1).addMessage(text))
      .to.emit(messageChain, "MessageAdded") // Verify event emission
      .withArgs(addr1.address, text, "EventTest"); // Check event arguments
  });
});