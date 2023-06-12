import React from "react";
import axios from 'axios';
import pako from "pako";
import zlib from 'zlib';
// import compressionInterceptor from "../utils/myInterceptor";

function Orders() {
    const [orders, setOrders] = React.useState([]);
    const token = "AQIC5wM2LY4Sfcx7JADZclhgPTcQIGpm8E3xefQZjqidt0Q.*AAJTSQACMDE.*";
    const url = "http://localhost:3001/reports/test_compression.json?token="+token;
    const headers = {
        "Compressed": true,
        "Content-Type": "text/plain",
    };
    let data = {id: 21, name: 'Khalid', age: 35, status: 'Married'};
    const compressedData = compressData(data);
    const fetchData = async () => {
        try {
            const response = await axios.post(url, compressedData, {
                headers: headers,
                responseType: 'blob'
            });
            if (response.headers['content-type'] === 'application/octet-stream') {
                const reader = new FileReader();
                reader.onload = () => {
                    const compressedData = reader.result;
                    console.log(compressedData);
                    const uncompressedData = decompressData(compressedData);
                    response.data = JSON.parse(uncompressedData.target[0]);
                    console.log('====== DATA=======');
                    console.log(response.data);
                };
                reader.readAsArrayBuffer(response.data);
            }
        } catch (error) {
            console.log(error);
        }
    };


    return (
        <div>
            <button onClick={fetchData}>Fetch Data</button>
            <h2>Response</h2>
            <p>{orders}</p>
        </div>
    );
}

function compressData(data) {
    const jsonString = JSON.stringify(data);
    const compressedData = zlib.deflateSync(jsonString).toString('base64');
    return compressedData;
}

function decompressData(compressedData) {
    const uncompressedData = pako.inflate(new Uint8Array(compressedData));
    const decoder = new TextDecoder();
    const decodedData = decoder.decode(uncompressedData);
    const jsonData = JSON.parse(decodedData);
    return jsonData;
}
export default Orders;