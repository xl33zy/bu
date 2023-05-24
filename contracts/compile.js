const fs = require("fs");
const solc = require("solc");

let fName = "example.sol";
let cName = "Example";

let ABI;
let bytecode;
let output;

function main() {
    // считаем код контракта из файла
    let cCode = fs.readFileSync(__dirname + "\\" + fName, "utf-8");

    try {
        myCompiler(solc, fName, cName, cCode);
    } catch (err) {
        console.log(err);

        let compileVersion = "v0.8.15+commit.e14f2714";
        solc.loadRemoteVersion(compileVersion, (err, solcSnapshot) => {
            if (err) {
                console.log(err);
            } else {
                myCompiler(solcSnapshot, fName, cName, cCode);
            }
        });
    }
}

function myCompiler(solc, fileName, contractName, contractCode) {
    let input = {
        language: "Solidity",
        sources: {
            [fileName]: {
                content: contractCode,
            },
        },
        settings: {
            outputSelection: {
                "*": {
                    "*": ["*"],
                },
            },
        },
    };
    output = JSON.parse(solc.compile(JSON.stringify(input)));
    
    wtiteAbiAndBytecodeFiles(contractName);
}

function wtiteAbiAndBytecodeFiles(contractName) {
    
    ABI = output.contracts[fName][contractName].abi;
    bytecode = output.contracts[fName][contractName].evm.bytecode.object;

    fs.writeFileSync(
        __dirname + "\\" + contractName + ".abi",
        JSON.stringify(ABI)
    );
    fs.writeFileSync(__dirname + "\\" + contractName + ".bin", bytecode);
}

main();
