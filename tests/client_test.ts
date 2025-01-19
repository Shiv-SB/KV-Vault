const endpoint = `ws://localhost:8080`;

const limit = 100000;

for (let i = 0; i < limit; i++) {
    const socket = new WebSocket(endpoint);
}