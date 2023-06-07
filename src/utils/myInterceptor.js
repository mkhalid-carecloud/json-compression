import axios from 'axios';
import pako from "pako";

const dataCompressor = axios.interceptors.request.use(
    function(config) {
        if (config.data && typeof config.data === 'object' && config.method === 'post' && config.headers['Content-Type'] === 'text/plain') {
            console.log('====== INSIDE INTERCEPTOR');
            console.log(config.data);
            const compressedData = compressData(config.data);
            config.data = compressedData;
        }
        return config;
    },
    function(error) {
        return Promise.reject(error);
    }
);

const compressionInterceptor = axios.interceptors.response.use(
    function(response) {
        if (response.headers['content-type'] === 'application/octet-stream') {
            const reader = new FileReader();
            reader.onload = () => {
                const compressedData = reader.result;
                console.log(compressedData);
                const uncompressedData = decompressData(compressedData);
                response.data = JSON.parse(uncompressedData.target[0]);
                console.log(" ====== INTERCEPTOR: ");
                console.log(response);
            };
            reader.readAsArrayBuffer(response.data);

        }
    },
    function(error) {
    return Promise.reject(error);
    }
);


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


export default compressionInterceptor;
