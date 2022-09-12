import * as crypto from 'crypto';

class Transaction {constructor(
    public amount: number,
    public payer: string,
    public payee: string,
){}
toString() {
    return JSON.stringify(this);
}    
}

class Block {
    public nonce = Math.round(Math.random() * 999999999);
    
    constructor(
    public prevHash: string,
    public transaction: Transaction,
    public ts = Date.now(),
){}
get hash() {
    const str = JSON.stringify(this);
    const hash = crypto.createHash('SHA256');
    return hash.digest('hex');
    return hash.digest('hex');
}
}

class Chain {
    public static instance = new Chain();
    chain: Block[];
    constructor(){
        this.chain = [new Block('', new Transaction(100, 'genesis','satoshi'))];
    }
    get lastBlock(){
        return this.chain[this.chain.length - 1];
    }
    mine(nonce:number){
        let solution = 1;
        console.log('mining...')
        while(true){
           const hash = crypto.createHash('MD5');
           hash.update((nonce + solution).toString()).end();
           
           const attempt = hash.digest('hex');

           if(attempt.substring(0,4) === '0000'){
            console.log('Solved: ${solution}');
            return solution;
           }

           solution += 1;
        }
    }
    addBlock(transaction: Transaction, senderPublicKey: string, signature: Buffer){
        const newBlock = new Block(this.lastBlock.hash,transaction);
        this.chain.push(newBlock);

        const verifier = crypto.createVerify('SHAA256');
        verifier.update(transaction.toString());

        const isValid =  verifier.verify(senderPublicKey, signature);

        if (isValid) {
            const newBlock = new Block(this.lastBlock.hash, transaction);
            this.mine(newBlock.nonce);
            this.chain.push(newBlock);
        }
    }

}
class Wallet {
    public publicKey: string;
    public privateKey: string;

    constructor(){
        const keypair = crypto.generateKeyPairSync('rsa', {
            modulusLength: 4096,
            publicKeyEncoding:{type:'spki',format:'pem'},
            privateKeyEncoding:{type:'pkcs8',format:'pem'},
        });
        this.privateKey = keypair.privateKey;
        this.publicKey = keypair.publicKey;
        (err: Error | null, publicKey : string, privateKey: string) => {
            if (err) throw err
            return {publicKey, privateKey}
        }
    }
    sendMoney(amount: number, payeePublicKey: string){
        const transaction = new Transaction(amount, this.publicKey, payeePublicKey);
        
        const sign = crypto.createSign('SHA256');
        sign.update(transaction.toString()).end();

        const signature = sign.sign(this.privateKey);
        Chain.instance.addBlock(transaction, this.publicKey, signature);
    }
}
const satoshi = new  Wallet();
const linda = new  Wallet();
const hans = new  Wallet();

satoshi.sendMoney(50,linda.publicKey);
linda.sendMoney(12, hans.publicKey);
hans.sendMoney(100, linda.publicKey);

console.log(Chain.instance)
