import { randomUUIDv7 } from "bun";
import { Database, Statement } from "bun:sqlite";

interface Record_Vault {
    id: string;
    key: string;
    value: string;
}

interface Record_idSet {
    id: string;
    createdAt: BigInt;
}

interface Vault_Interface {
    set(key: string, value: string): string;
    get(id: string, key: string): Record_Vault | undefined;
    keyProperties(id: string): Record_idSet | undefined;
    parseDate(unixDate: BigInt): Date
}

class Vault implements Vault_Interface{
    
    private database: Database;

    constructor(vaultID: string) {
        this.database = new Database(":memory:", {
            safeIntegers: true,
        });
        this.database.exec("PRAGMA journal_mode = WAL;");
        this.createTables();
    }

    private createTables() {
        const createIdSet: Statement = this.database.query(`
            CREATE TABLE IF NOT EXISTS idSet (
                id TEXT PRIMARY KEY,
                createdAt INTEGER
            )
        `);
    
        const createVault: Statement = this.database.query(`
            CREATE TABLE IF NOT EXISTS vault (
                id TEXT PRIMARY KEY,
                key TEXT,
                value TEXT
            )
        `);
    
        createIdSet.run();
        createVault.run();
    
        createIdSet.finalize();
        createVault.finalize();
    }

    public set(key: string, value: string): string {

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

    private getFromSet(id: string): Record_idSet | undefined {
        const query: Statement = this.database.query(`SELECT * FROM idSet`);
        for (const row of query.iterate()) {
            const typedRow = row as Record_idSet | undefined;
            if (typedRow && typedRow.id === id) {
                return typedRow;
            }
        }
    }

    public get(id: string, key: string): Record_Vault | undefined {

        if (typeof key !== "string" || typeof id !== "string") {
            throw new Error(`ID and key must be strings`);
        }  

        const query: Statement = this.database.query(`SELECT * FROM vault`);
        for (const row of query.iterate()) {
            const typedRow = row as Record_Vault | undefined;
            if (typedRow && typedRow.id === id && typedRow.key === key) {
                return typedRow;
            }
        }
    }

    public keyProperties(id: string): Record_idSet | undefined {
        return this.getFromSet(id);
    }

    /**
     * Parse a BigInt unix date to JS Date object.
     * @param unixDate 
     * @returns 
     */
    public parseDate(unixDate: BigInt) {
        return new Date(Number(unixDate));
    }
}

const foo = new Vault("VAULT_1");

const ID = foo.set("foo", new Date().toISOString());

console.log("success", foo.get(ID, "foo")); // Should return record
console.log("fail:", foo.get("baz", "bar")); // Should return undefined

const props = foo.keyProperties(ID);

console.log("Date:", foo.parseDate(props?.createdAt!));