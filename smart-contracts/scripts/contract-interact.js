// Importing variables from .env file
require('dotenv').config();
const prompt = require('prompt-sync')({sigint: true});
const API_URL = process.env.API_URL;
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// importing Alchemy web3 library
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(API_URL);

// Grab contract ABI
const contract = require("../artifacts/contracts/HelloWorld.sol/HelloWorld.json");
// console.log(JSON.stringify(contract.abi));

// create an instance of our contract
const contractAddress = "0x40E3eb156976430Beb783B15ff39885b93b54D0A";
const helloWorldContract = new web3.eth.Contract(contract.abi, contractAddress);

// update the message variable
async function updateMessage(newMessage) {
    const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, 'latest'); // get latest nonce
    const gasEstimate = await helloWorldContract.methods.update(newMessage).estimateGas(); // estimate gas

    // Create the transaction
    const tx = {
      'from': PUBLIC_KEY,
      'to': contractAddress,
      'nonce': nonce,
      'gas': gasEstimate, 
      'maxFeePerGas': 1000000108,
      'data': helloWorldContract.methods.update(newMessage).encodeABI()
    };

    // Sign the transaction
    const signPromise = web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
    signPromise.then((signedTx) => {
      web3.eth.sendSignedTransaction(signedTx.rawTransaction, function(err, hash) {
        if (!err) {
          console.log("The hash of your transaction is: ", hash, "\n Check Alchemy's Mempool to view the status of your transaction!");
        } else {
          console.log("Something went wrong when submitting your transaction:", err)
        }
      });
    }).catch((err) => {
      console.log("Promise failed:", err);
    });
}

// call the message function in our smart contract and read the init message
async function main() {
    const message = await helloWorldContract.methods.message().call();
    console.log("The message is: " + message);
    const newMessage = prompt("Input new message here: ");
    await updateMessage(newMessage);
  }
  main();