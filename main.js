// hash calculating function
const SHA256 = require('crypto-js/sha256');

// template of a transaction
class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
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
        }

        console.log("Block mined: " + this.hash);
    }
}


// template of the blockchain. it's basically just an array of blocks with certain other parameters subjective to the blockchain use case
class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 3;
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
        let block = new Block(Date.now(), this.pendingTransactions);
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined');
        block.previousHash = this.chain[this.chain.length-1].hash;
        this.chain.push(block);
        this.pendingTransactions = [ 
            new Transaction(null, miningRewardAddress, this.miningReward) 
        ];
    }

    // creates a new transaction and adds it into the pending transactions array
    createTransaction(transaction){
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

// intialises a new blockchain
let krishCoin = new Blockchain();

// creates transactions and adds them in pending transactions
krishCoin.createTransaction(new Transaction('address1', 'address2', 100));
krishCoin.createTransaction(new Transaction('address2', 'address1', 50));

// mines blocks for pending transaction and registers them in those mined blocks
console.log("\nStarting the miner...");
krishCoin.minePendingTransactions("reward-address");
console.log("Your balance is: " + krishCoin.getBalanceOfAddress("reward-address"));

// the reward transaction to the miner is again stored in pending transactions, hence this registers that transaction in the blockchain
console.log("\nStarting the miner...");
krishCoin.minePendingTransactions("reward-address");
console.log("Your balance is: " + krishCoin.getBalanceOfAddress("reward-address"));
// still another transaction remains in pending transactions as another reward transaction is created

// shows what our blockchain looks like in the terminal
console.log(JSON.stringify(krishCoin, null, 4));