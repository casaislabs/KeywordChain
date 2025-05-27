export const contractAddress = "0xD91905FD695d566440a40080a66c18155F30cB40";

export const contractABI = [
  {
    inputs: [{ internalType: "string", name: "firstKeyword", type: "string" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "EmptyText", type: "error" },
  { inputs: [], name: "InvalidCharacters", type: "error" },
  { inputs: [], name: "InvalidKeyword", type: "error" },
  { inputs: [], name: "KeywordTooLong", type: "error" },
  { inputs: [], name: "OutOfRange", type: "error" },
  { inputs: [], name: "ReentrantCall", type: "error" },
  { inputs: [], name: "TextTooLong", type: "error" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "author",
        type: "address",
      },
      { indexed: false, internalType: "string", name: "text", type: "string" },
      {
        indexed: false,
        internalType: "string",
        name: "keyword",
        type: "string",
      },
    ],
    name: "MessageAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "start",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "count",
        type: "uint256",
      },
    ],
    name: "MessagesRetrieved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "keyword",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "count",
        type: "uint256",
      },
    ],
    name: "MessagesSearched",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "ReentrancyDetected",
    type: "event",
  },
  {
    inputs: [{ internalType: "string", name: "text", type: "string" }],
    name: "addMessage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getLastMessage",
    outputs: [
      {
        components: [
          { internalType: "address", name: "author", type: "address" },
          { internalType: "string", name: "text", type: "string" },
          { internalType: "string", name: "keyword", type: "string" },
        ],
        internalType: "struct MessageChain.Message",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "start", type: "uint256" },
      { internalType: "uint256", name: "count", type: "uint256" },
    ],
    name: "getMessages",
    outputs: [
      {
        components: [
          { internalType: "address", name: "author", type: "address" },
          { internalType: "string", name: "text", type: "string" },
          { internalType: "string", name: "keyword", type: "string" },
        ],
        internalType: "struct MessageChain.Message[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getMessagesCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "keyword", type: "string" }],
    name: "isValidKeyword",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "messages",
    outputs: [
      { internalType: "address", name: "author", type: "address" },
      { internalType: "string", name: "text", type: "string" },
      { internalType: "string", name: "keyword", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "keyword", type: "string" }],
    name: "searchMessagesByKeyword",
    outputs: [
      {
        components: [
          { internalType: "address", name: "author", type: "address" },
          { internalType: "string", name: "text", type: "string" },
          { internalType: "string", name: "keyword", type: "string" },
        ],
        internalType: "struct MessageChain.Message[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
