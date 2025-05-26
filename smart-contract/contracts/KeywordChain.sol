// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MessageChain {
    /// @notice Represents a message in the chain.
    /// @param author The address of the message author.
    /// @param text The content of the message.
    /// @param keyword The keyword associated with the message.
    struct Message {
        address author;
        string text;
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

    /// @notice Initializes the chain with a starting keyword.
    /// @param firstKeyword The initial keyword to start the chain.
    constructor(string memory firstKeyword) {
        require(bytes(firstKeyword).length > 0, "Initial keyword is empty");
        require(
            bytes(firstKeyword).length <= MAX_KEYWORD_LENGTH,
            "Initial keyword is too long"
        );
        require(isValidKeyword(firstKeyword), "Initial keyword contains invalid characters");
        messages.push(Message(address(0), unicode"Chain start", firstKeyword));
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
    /// @dev The message must contain the keyword from the previous message.
    function addMessage(string calldata text) external onlyValidText(text) nonReentrant {
        string memory lastKeyword = messages[messages.length - 1].keyword;

        if (!containsWord(text, lastKeyword)) revert InvalidKeyword();

        string memory newKeyword = extractLastWord(text);
        if (bytes(newKeyword).length == 0) revert InvalidKeyword();
        if (bytes(newKeyword).length > MAX_KEYWORD_LENGTH) revert KeywordTooLong();
        if (!isValidKeyword(newKeyword)) revert InvalidCharacters();

        messages.push(Message(msg.sender, text, newKeyword));

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
            if (containsWord(messages[i].text, keyword)) {
                count++;
            }
        }

        // Create the final array with the exact size
        Message[] memory matchingMessages = new Message[](count);
        uint index = 0;

        // Second pass: populate the array
        for (uint i = 0; i < messages.length; i++) {
            if (containsWord(messages[i].text, keyword)) {
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

    /// @dev Checks if a text contains a specific keyword.
    /// @param haystack The text to search within.
    /// @param needle The keyword to search for.
    /// @return True if the keyword is found, false otherwise.
    function containsWord(
        string memory haystack,
        string memory needle
    ) internal pure returns (bool) {
        bytes memory hay = bytes(haystack);
        bytes memory need = bytes(needle);
        if (need.length > hay.length) return false;

        for (uint i = 0; i <= hay.length - need.length; i++) {
            bool isMatch = true;
            for (uint j = 0; j < need.length; j++) {
                if (hay[i + j] != need[j]) {
                    isMatch = false;
                    break;
                }
            }
            if (isMatch) return true;
        }
        return false;
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