// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MessageChain {
    /// @notice Represents a message in the chain.
    /// @param author The address of the message author.
    /// @param keyword The keyword associated with the message.
    struct Message {
        address author;
        string keyword;
    }

    /// @notice Array to store all messages in the chain.
    Message[] public messages;

    /// @notice Emitted when a new message is added to the chain.
    /// @param author The address of the message author.
    /// @param text The content of the message.
    /// @param keyword The keyword associated with the message.
    event MessageAdded(address indexed author, string text, string keyword);

    /// @notice Emitted when a reentrant call is detected.
    event ReentrancyDetected(address indexed caller);

    /// @notice Emits an event when messages are searched.
    /// @param keyword The keyword used for the search.
    /// @param count The number of matching messages found.
    event MessagesSearched(string keyword, uint count);

    /// @notice Emits an event when messages are retrieved in pagination.
    /// @param start The starting index of the retrieved messages.
    /// @param count The number of messages retrieved.
    event MessagesRetrieved(uint start, uint count);

    /// @dev Custom errors to optimize gas usage.
    error EmptyText();
    error InvalidKeyword();
    error OutOfRange();
    error TextTooLong();
    error KeywordTooLong();
    error ReentrantCall();
    error InvalidCharacters();

    /// @dev Constants to limit the length of text and keywords.
    uint immutable MAX_TEXT_LENGTH = 256;
    uint immutable MAX_KEYWORD_LENGTH = 32;

    /// @dev Reentrancy guard variable.
    bool private locked;

    /// @notice Initializes the chain with a default message.
    constructor() {
        // Add the initial message directly on-chain
        messages.push(Message(address(0), "initialKeyword"));
    }

    /// @dev Modifier to validate that the text is not empty and does not exceed the maximum length.
    /// @param text The text to validate.
    modifier onlyValidText(string calldata text) {
        if (bytes(text).length == 0) revert EmptyText();
        if (bytes(text).length > MAX_TEXT_LENGTH) revert TextTooLong();
        _;
    }

    /// @dev Modifier to prevent reentrant calls.
    modifier nonReentrant() {
        if (locked) {
            emit ReentrancyDetected(msg.sender);
            revert ReentrantCall();
        }
        locked = true;
        _;
        locked = false;
    }

    /// @notice Adds a new message to the chain.
    /// @param text The content of the message.
function addMessage(string calldata text) external onlyValidText(text) nonReentrant {
    // Extract the last word from the text as the new keyword
    string memory newKeyword = extractLastWord(text);

    // Validate the new keyword
    if (bytes(newKeyword).length == 0) revert InvalidKeyword();
    if (bytes(newKeyword).length > MAX_KEYWORD_LENGTH) revert KeywordTooLong();
    if (!isValidKeyword(newKeyword)) revert InvalidCharacters();

    // Validate that the new phrase starts with the last keyword of the last message
    if (messages.length > 0) {
        string memory lastKeyword = messages[messages.length - 1].keyword;
        bytes memory textBytes = bytes(text);
        bytes memory lastKeywordBytes = bytes(lastKeyword);

        // Ensure the text starts with the last keyword
        for (uint i = 0; i < lastKeywordBytes.length; i++) {
            if (i >= textBytes.length || textBytes[i] != lastKeywordBytes[i]) {
                revert InvalidKeyword(); // New phrase does not start with the last keyword
            }
        }
    }

    // Add the new message to the chain
    messages.push(Message(msg.sender, newKeyword));

    emit MessageAdded(msg.sender, text, newKeyword);
}

    /// @notice Returns the total number of messages in the chain.
    /// @return The total number of messages.
    function getMessagesCount() external view returns (uint) {
        return messages.length;
    }

    /// @notice Retrieves messages in a paginated manner.
    /// @param start The starting index of the messages to retrieve.
    /// @param count The number of messages to retrieve.
    /// @return An array of messages.
    function getMessages(
        uint start,
        uint count
    ) external view returns (Message[] memory) {
        if (start >= messages.length) revert OutOfRange();
        uint end = start + count > messages.length
            ? messages.length
            : start + count;

        Message[] memory paginatedMessages = new Message[](end - start);
        unchecked {
            for (uint i = start; i < end; i++) {
                paginatedMessages[i - start] = messages[i];
            }
        }
        return paginatedMessages;
    }

    /// @notice Searches for messages containing a specific keyword.
    /// @param keyword The keyword to search for.
    /// @return An array of messages that contain the keyword.
    function searchMessagesByKeyword(
        string calldata keyword
    ) external view returns (Message[] memory) {
        if (!isValidKeyword(keyword)) revert InvalidCharacters();

        uint count = 0;

        // First pass: count matching messages
        for (uint i = 0; i < messages.length; i++) {
            if (keccak256(bytes(messages[i].keyword)) == keccak256(bytes(keyword))) {
                count++;
            }
        }

        // Create the final array with the exact size
        Message[] memory matchingMessages = new Message[](count);
        uint index = 0;

        // Second pass: populate the array
        for (uint i = 0; i < messages.length; i++) {
            if (keccak256(bytes(messages[i].keyword)) == keccak256(bytes(keyword))) {
                matchingMessages[index] = messages[i];
                index++;
            }
        }

        return matchingMessages;
    }

    /// @notice Retrieves the last message in the chain.
    /// @return The last message in the chain.
    function getLastMessage() external view returns (Message memory) {
        if (messages.length == 0) revert OutOfRange(); // Handle case where no messages exist
        return messages[messages.length - 1];
    }

    /// @dev Extracts the last word from a given text.
    /// @param text The text to extract the last word from.
    /// @return The last word in the text.
    function extractLastWord(
        string memory text
    ) internal pure returns (string memory) {
        bytes memory strBytes = bytes(text);
        uint end = strBytes.length;
        uint start = end;

        while (start > 0 && strBytes[start - 1] != " ") {
            start--;
        }

        bytes memory result = new bytes(end - start);
        for (uint i = 0; i < end - start; i++) {
            result[i] = strBytes[start + i];
        }

        return string(result);
    }

    /// @notice Validates the keyword for allowed characters.
    /// @param keyword The keyword to validate.
    /// @return True if the keyword is valid, false otherwise.
    function isValidKeyword(string memory keyword) public pure returns (bool) {
        bytes memory keywordBytes = bytes(keyword);
        if (keywordBytes.length == 0) {
            return false; // Reject empty strings
        }
        for (uint i = 0; i < keywordBytes.length; i++) {
            bytes1 char = keywordBytes[i];
            if (
                !(char >= 0x30 && char <= 0x39) && // 0-9
                !(char >= 0x41 && char <= 0x5A) && // A-Z
                !(char >= 0x61 && char <= 0x7A)    // a-z
            ) {
                return false;
            }
        }
        return true;
    }
}