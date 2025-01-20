class VaultClient {

    private socket: WebSocket;
    private vaultID: Buffer;

    constructor(url: string, vaultID: string) {
        this.socket = new WebSocket(url);
        this.vaultID = Buffer.from(vaultID);
    }

    private waitForOpenConnection(callback: () => any) {
        if (this.socket.readyState === WebSocket.OPEN) {
            callback();
        } else {
            this.socket.addEventListener('open', () => {
                callback();
            }, { once: true });
        }
    }

    private mergeBuffers(...buffs: Buffer[]): Buffer {
        const totalLength: number = buffs.reduce((sum, buff) => sum + buff.byteLength, 0);
        const mergedBuffer: Buffer = new Buffer(totalLength);
    
        let offset = 0;
        for (const buff of buffs) {
            mergedBuffer.set(buff, offset);
            offset += buff.byteLength;
        }
    
        return mergedBuffer;
    }
       

    private createVaultIfNotExists(vaultID: string) {

    }

    public send(data: string) {
        this.waitForOpenConnection(() => {
            const dataAsBuffer: Buffer = Buffer.from(data);
            const dataToSend = this.mergeBuffers(this.vaultID, dataAsBuffer);
            this.socket.send(dataToSend);
        });
    }

    public close() {
        this.socket.close();
    }
}

const client = new VaultClient("ws://localhost:8080", "VAULT_1");

client.send("Hello World!");
client.send("Hello World again!");

//client.close();