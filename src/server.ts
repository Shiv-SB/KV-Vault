import { serve } from "bun";

type WebSocketData = {
    createdAt: number;
    ID: string;
    url: URL;
}

const websocketSessions = new Map<string, WebSocketData>();

const server = serve<WebSocketData>({
    port: 8080,
    
    async fetch(req, server) {
        const success = server.upgrade(req, {
            data: {
                createdAt: Date.now(),
                ID: crypto.randomUUID(),
                url: new URL(req.url),
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
            const recievedMessage: string | Buffer = message;
            //console.log("Recieved Type:", recievedMessage instanceof Buffer ? "Buffer" : typeof recievedMessage);
            if (message instanceof Buffer) {
                console.log("buff to string:", recievedMessage.toString());
                console.log("url:", ws.data.url.toString());
            }
            //console.log(`Recieved "${message instanceof Buffer}"`);
            ws.send(`You said "${message}"`);
            
        },
        sendPings: true,
    }
});

console.log(`Listening on ${server.hostname}:${server.port}`);