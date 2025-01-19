import { randomUUIDv7 } from "bun";
import { Database, Statement } from "bun:sqlite";

interface Vault_Interface {

}

class Vault implements Vault_Interface{
    
    private database: Database;

    constructor(vaultID: string) {
        //this.database = new Database(":memory:");
        this.database = new Database("database.SQLite", {
            safeIntegers: true,
        });
        this.createTable();
    }

    private createTable() {
        const createVault: Statement = this.database.query(`
                CREATE TABLE IF NOT EXISTS vault(
                    id TEXT PRIMARY KEY,
                    key TEXT,
                    value TEXT
                )
            `);

        const createIdSet: Statement = this.database.query(`
                CREATE TABLE IF NOT EXISTS idSet(
                    id TEXT PRIMARY KEY,
                    createdAt INTEGER
                )
            `);

        createVault.run();
        createIdSet.run();
    }

    public set(key: string, value: string) {

        if (typeof key !== "string" || typeof value !== "string") {
            throw new Error(`Key and value must be strings`);
        }    

        const recordID = randomUUIDv7();

        const uploadToVault = this.database.query(`INSERT INTO vault (id, key, value) VALUES ($id, $key, $value)`);
        uploadToVault.run({
            $id: recordID,
            $key: key,
            $value: value
        });

        const saveID = this.database.query(`INSERT INTO IdSet (id, createdAt) VALUES ($id, $createdAt)`); 
        saveID.run({
            $id: recordID,
            $createdAt: BigInt(Date.now()),
        });

        console.log(recordID);
        return recordID;
        
    }

    public get(key: string) {

    }

}

const foo = new Vault("VAULT_1");

foo.set("foo", "bar");