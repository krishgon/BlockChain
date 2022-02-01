// hash calculating function
const SHA256 = require('crypto-js/sha256');

const EC = require('elliptic').ec;
const ec = new EC("secp256k1");

// template of a transaction
class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingKey){
        if(signingKey.getPublic('hex') !== this.fromAddress){
            throw new Error('You cannot sign transactions for other wallets!');
        }

         const hashTx = this.calculateHash();
         const sig = signingKey.sign(hashTx, 'base64');
         this.signature = sig.toDER('hex');
    }

    isValid(){
        if(this.fromAddress == null) return true;

        if(!this.signature || this.signature.length == 0){
            throw new Error('No signature in this transaction');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

// template of a block in the blockchain
class Block{
    constructor(timestamp, transactions, previousHash = ''){
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash(){
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    // assigns a hash to the block which will take a certain amount of time and computer power to generate. this is decided by the parameter difficulty and is directly proportional to the value of difficulty  
    mineBlock(difficulty){
        while(this.hash.substring(0, difficulty) != Array(difficulty + 1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();
            console.log(this.hash);
        }

        console.log("Block mined: " + this.hash);
    }

    hasValidTransactions(){
        for(const tx of this.transactions){
            if(!tx.isValid()){
                return false;
            }
        }

        return true;
    }
}


// template of the blockchain. it's basically just an array of blocks with certain other parameters subjective to the blockchain use case
class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 5;
        this.pendingTransactions = []; // all the transactions which are to be registered in a block
        this.miningReward = 100; // reward for the person who gives his computing power to register pending transactions in a block
    }

    // adds the first block in the chain
    createGenesisBlock(){
        var genBlock =  new Block("01/01/2022", "Genesis Block", "0");
        genBlock.hash = genBlock.calculateHash();
        return genBlock;
    }

    // registers the pending transactions in a block and adds the block in the blockchain. It's called mining as it involves the generation of a new hash for a new block which takes a lot of time and effort
    minePendingTransactions(miningRewardAddress){
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx);

        let block = new Block(Date.now(), this.pendingTransactions);
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined');
        block.previousHash = this.chain[this.chain.length-1].hash;
        this.chain.push(block);
        this.pendingTransactions = [];
    }

    // creates a new transaction and adds it into the pending transactions array
    addTransaction(transaction){
        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error('Transaction must include from and to address');
        }
        if(!transaction.isValid()){ throw new Error('Cannot add invalid transaction to chain'); }

        this.pendingTransactions.push(transaction);
    }

    // returns the total balance of an address by scanning every transaction of the blockchain
    getBalanceOfAddress(address){
        let balance = 0;
        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.fromAddress == address){
                    balance -= trans.amount;
                }
                if(trans.toAddress == address){
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    // returns false if someone changed something in a block of the chain
    isChainValid(){
        for(let i=1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];

            if(!currentBlock.hasValidTransactions()){
                return false;
            }

            if (currentBlock.hash != currentBlock.calculateHash()){
                return false;
            }
            if(currentBlock.previousHash != previousBlock.hash){
                return false;
            }
        }
        return true;
    }
}


module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;