const fs = require("fs");
const path = require("path");

let arguments = process.argv.slice(2);
if (arguments.length < 1)
    throw "Not enough arguments. Pass name of the folder and parameter -DQ# (number of DQ game). Use no parameter to get unecrypted file";

let folderName = arguments[0];
let version = arguments[1];

let fileNames = [];
let files = [];

fs.readdirSync(folderName).forEach(file => {
        fileNames.push(file);
        let currentFile = fs.readFileSync(path.join(folderName, file));
        files.push(currentFile);
});        

let fileCount = Buffer.alloc(2);
fileCount.writeInt16BE(fileNames.length, 0);
fs.writeFileSync(folderName + ".dat", fileCount);

for (let i=0; i<fileNames.length; i++)
{
    let nameLength = Buffer.alloc(2);
    nameLength.writeInt16BE(fileNames[i].length, 0);
    fs.writeFileSync(folderName + ".dat", nameLength, { flag: "a" });
    fs.writeFileSync(folderName + ".dat", fileNames[i], { flag: "a" });
}

fileCount.writeInt16BE(files.length, 0);
fs.writeFileSync(folderName + ".dat", fileCount, { flag: "a" });

for (let i=0; i<files.length; i++)
{
    let fileSize = Buffer.alloc(4);
    fileSize.writeInt32BE(files[i].length, 0);
    fs.writeFileSync(folderName + ".dat", fileSize, { flag: "a" });
}

for (let i=0; i<files.length; i++)
    fs.writeFileSync(folderName + ".dat", files[i], { flag: "a" });

if (version){
    let encryption_key = [0x46, 0x78, 0x63, 0x15];
    if (version == '-DQ3') encryption_key = [0x4e, 0x69, 0x29, 0x75];
    let filetoEncrypt = fs.readFileSync(folderName + ".dat");
    for (let i=0; i<filetoEncrypt.length; i++)
        filetoEncrypt[i] ^= encryption_key[i % encryption_key.length];
    fs.writeFileSync(folderName + ".dat", filetoEncrypt);
}

