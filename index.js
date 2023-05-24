const Web3 = require("web3");
const fs = require("fs");

const web3 = new Web3("ws://127.0.0.1:7545");

let exampleContract;
let ABI;
let bytecode;
let accountForDeploy;
let accountForEvent;
let receiveEvent;
let setDataEvent;

async function main() {
    await setupContract();
    await setupEvents();
}

async function setupContract() {
    createAccountForDeploy();
    getAbiAndBytecode();
    await deployContract();
}

function createAccountForDeploy() {
    accountForDeploy = web3.eth.accounts.privateKeyToAccount(
        "0x1f5d354101af1c7728b3539213d483b538fac2f8d6f094dbcf380e1b720c26f1"
    );
    web3.eth.defaultAccount = accountForDeploy.address;
    console.log(
        "Account for deployment created. Address: ",
        accountForDeploy.address
    );
}

function getAbiAndBytecode() {
    ABI = JSON.parse(
        fs.readFileSync("contracts" + "\\" + "Example.abi", "utf-8")
    );
    bytecode = fs.readFileSync("contracts" + "\\" + "Example.bin", "utf-8");
}

async function deployContract() {
    exampleContract = new web3.eth.Contract(ABI);

    await exampleContract
        .deploy(
            {
                data: bytecode,
                arguments: [5, "coca cola", [3, 4, 5]],
            },
            (error, transactionHash) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log(transactionHash);
                }
            }
        )
        .send({
            from: accountForDeploy.address,
            gas: 3_000_000,
        })
        .then((newContractInstance) => {
            exampleContract = newContractInstance;
        });

    console.log(
        "Contract deployed. Address: ",
        exampleContract.options.address
    );
}

async function setupEvents() {
    await setEvents();
    createAccountForEvent();
    await sendTransactionToContract();
}

function createAccountForEvent() {
    // для тестирования receiveEvent
    accountForEvent = web3.eth.accounts.privateKeyToAccount(
        "0x18795aa2e8623dd5dc9279aebbe8d52551ceb14b5be3e82669a168104d410b5c"
    );
    console.log(
        "Account for event created. Address: ",
        accountForEvent.address
    );
}

async function setEvents() {
    receiveEvent = web3.utils.sha3("Receive(address,uint256");
    setDataEvent = web3.utils.sha3("SetData(uint256,string,uint256[]");

    const receiveEventSubscription = await exampleContract.events
        .Receive({
            topics: [receiveEvent],
        })
        .on("data", function (logs) {
            console.log("RECEIVE EVENT START");
            console.log(logs);
            console.log("RECEIVE EVENT END");
            // receiveEventSubscription.unsubscribe();
        });

    const setDataSubscription = await exampleContract.events
        .SetData({
            topics: [setDataEvent],
        })
        .on("data", function (logs) {
            console.log("SET DATA EVENT START");
            console.log(logs);
            console.log("SET DATA EVENT END");
            // setDataSubscription.unsubscribe();
        });
}

// отправляет транзакцию на контракт чтобы затестить ReceiveEvent в receive контракта
async function sendTransactionToContract() {
    let transaction = await web3.eth.accounts.signTransaction(
        {
            from: accountForEvent.address,
            to: exampleContract.options.address,
            gas: 50_000,
            value: 100_000,
        },
        accountForEvent.privateKey
    );

    await web3.eth
        .sendSignedTransaction(transaction.rawTransaction)
        .on("receipt", console.log);
}

main();

// Напишите контракт, который содержит два ивента:

// Receive(address indexed sender, uint256 indexed value);
// SetData(uint256 indexed number, string str, uint256 data);

// А также функции

// receive(){}
// SetData(uint256 number, string str, uint256 data){}

// В которых вызываются указанные выше ивенты

// Напишите скрипт, который развернёт этот скрипт в тестовой сети
// А затем подпишется на оба события

// Создайте пару транзакций с вызовом указанных функций, убедитесь, что в терминал выводится информация о срабатывании событий

// TERMINAL
