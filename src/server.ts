import { serve } from "bun";

interface WsData {
    createdAt: number;
    ID: string;
}

const websocketSessions = new Map<string, WsData>();

const server = serve<WsData>({
    port: 8080,
    
    async fetch(req, server) {
        const success = server.upgrade(req, {
            data: {
                createdAt: Date.now(),
                ID: crypto.randomUUID(),
            }
        });
        if (success) {
            return undefined;
        }
        return new Response("Hello World!");
    },

    websocket: {
        open(ws) {
            console.log(`New connection: ${ws.data.ID}`);
            websocketSessions.set(ws.data.ID, {
                ...ws.data
            });
        },
        close(ws, code, reason) {
            console.log(`Closed connection: ${ws.data.ID}`);
            websocketSessions.delete(ws.data.ID);
        },
        async message(ws, message) {
            console.log(`Recieved "${message}"`);
            ws.send(`You said "${message}"`);
            
        },
        sendPings: true,
    }
});

console.log(`Listening on ${server.hostname}:${server.port}`);

setInterval(() => {
    console.log("Total connections:", websocketSessions.size);
}, 5000);