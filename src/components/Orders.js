import React from "react";
import axios from "axios";
import pako from 'pako';

function Orders() {
    const [orders, setOrders] = React.useState([]);
    const token = "AQIC5wM2LY4SfczW6MVQxmocNf6sg0TF9e05jXRkIRgKJa4.*AAJTSQACMDE.*";
    const url = "http://localhost:3000/order_sets/find.json?id=27117&token="+token;
    const headers = {
        "Compressed": true,
        "Content-Type": "text/plain",
    };
    let data = {id: 21, name: 'Khalid', age: 35, status: 'Married'};
    const compressedData = compressData(data);

    React.useEffect(() => {
        axios.get(url, {
            headers: headers,
            responseType: 'blob',
        })
            .then((response) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const compressedData = reader.result;
                    const uncompressedData = decompressData(compressedData);
                    console.log(uncompressedData.target[0]);
                    setOrders(uncompressedData.target[0]);
                };
                reader.readAsArrayBuffer(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    return (
        <div>
            <h2>Response</h2>
            <p>{orders}</p>
        </div>
    );
}

function compressData(data) {
    const jsonString = JSON.stringify(data);
    const compressedData = pako.deflate(jsonString, { level: 9 });
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