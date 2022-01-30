const {Blockchain, Transaction} = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC("secp256k1");

const myKey = ec.keyFromPrivate('51c149684e41b7148ce886b52a658fe20dbeddc767e42dc25650060a0c715bc0');
const myWalletAddress = myKey.getPublic('hex');

// intialises a new blockchain
let krishCoin = new Blockchain();

// creates transactions and adds them in pending transactions
const tx1 = new Transaction(myWalletAddress, 'publicKey', 10);
tx1.signTransaction(myKey);
krishCoin.addTransaction(tx1);

// mines blocks for pending transaction and registers them in those mined blocks
console.log("\nStarting the miner...");
krishCoin.minePendingTransactions(myWalletAddress);
console.log("Your balance is: " + krishCoin.getBalanceOfAddress(myWalletAddress));