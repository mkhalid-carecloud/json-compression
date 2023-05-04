import crypto from 'crypto-browserify'
import CryptoJS from 'crypto-js';
import React from "react";
import axios from "axios";
import pako from 'pako';
import zlib from 'zlib';
import { Buffer } from 'buffer';

function Orders() {
    const [orders, setOrders] = React.useState([]);
    const token = "AQIC5wM2LY4SfcwE9D_QdtBf3YY7TA8UJlh0zI25ONXlQbI.*AAJTSQACMDE.*";
    const url = "http://localhost:3000/order_sets/test.json?token="+token;
    const headers = {
        "Compressed": true,
        "Content-Type": "text/plain",
    };
    let data = {id: 21, name: 'Khalid', age: 35, status: 'Married'};
    const compressedData = compressData(data);
    console.log('Compressed Data: ' + compressedData);

    React.useEffect(() => {
        axios.post(url, compressedData, {
            headers: headers,
            responseType: 'blob',
        })
            .then((response) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const compressedData = reader.result;
                    const uncompressedData = pako.inflate(new Uint8Array(compressedData));
                    const decoder = new TextDecoder();
                    const decodedData = decoder.decode(uncompressedData);
                    const jsonData = JSON.parse(decodedData);
                    console.log('jsonData: \n');
                    console.log(jsonData.target[0]);
                };
                reader.readAsArrayBuffer(response.data);

                // const startWord = 'target":';
                // const endWord = ',"connection_id"';
                //
                // const startIndex = decryptedData.indexOf(startWord);
                // const endIndex = decryptedData.indexOf(endWord) + endWord.length;
                //
                // const substring = decryptedData.substring(startIndex, endIndex);
                // const newText = substring.replace(startWord, "");
                // const jsonString = newText.replace(endWord, "");
                // console.log(JSON.parse(jsonString));
                // setOrders(JSON.parse(jsonString));
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    return (
        <p>{orders}</p>
    );
}

function decryptData(data, cipherKey) {
    const [encryptedData, iv] = data.split('--').map(v => Buffer.from(v, 'base64'));
    const cipher = crypto.createDecipheriv('aes-256-cbc', cipherKey, iv);
    cipher.iv = iv

    const decrypted = Buffer.concat([
        cipher.update(encryptedData),
        cipher.final(),
    ]);

    return decrypted.toString();
}

function encrypt(data) {
    const key = CryptoJS.enc.Utf8.parse('abcasndkajsdabcasndkajsdabcasnda');
    const iv = CryptoJS.enc.Utf8.parse('mynameismokhalid');

    const jsonString = JSON.stringify(data);

    const encrypted = CryptoJS.AES.encrypt(jsonString, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    const base64Iv = btoa(iv);
    const base64Encrypted = encrypted.toString();

    return `${base64Encrypted}--${base64Iv}`;
}


function compressData(data) {
    const jsonString = JSON.stringify(data);
    const compressedData = pako.deflate(jsonString, { level: 9 });
    return compressedData;
}

function decompressData(compressedData) {
    const decompressedData = zlib.inflate(compressedData);
    console.log('***** DATA: ' + decompressedData);
    return JSON.parse(decompressedData);
}
export default Orders;