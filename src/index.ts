import fs from "node:fs";
import path from "node:path";

/**
 * A class representing a file of data.
 */
export class Document {
    /**
     * @param loc The location of the file.
     */
    constructor(public loc: string) {
        this.loc = path.resolve(this.loc);
    }

    /**
     * Get the data from the file.
     * @returns The contents of the file as a parsed object.
     */
    public get(): unknown {
        if (!fs.existsSync(this.loc)) {
            return null;
        }
        return JSON.parse(fs.readFileSync(this.loc, "utf8"));
    }

    /**
     * Set the data in the file.
     * @param data The data to write to the file.
     * @param indent The number of spaces to indent the JSON.
     * @returns Document itself.
     */
    public set(data: unknown, indent = 0): this {
        fs.writeFileSync(this.loc, JSON.stringify(data, null, indent));
        return this;
    }

    /**
     * Delete the file.
     */
    public delete(): void {
        fs.rmSync(this.loc);
    }

    /**
     * If the underlying file exists.
     * @returns True if the file exists.
     */
    public get exists(): boolean {
        return fs.existsSync(this.loc);
    }

    /**
     * The size of the file in bytes.
     * @returns The size of the file in bytes, or 0 if the file does not exist.
     */
    public get size(): number {
        return this.exists ? fs.statSync(this.loc).size : 0;
    }

    /**
     * The last modified time of the file.
     * @returns The last modified time of the file, or `new Date(0)` if the file does not exist.
     */
    public get modified(): Date {
        return this.exists ? fs.statSync(this.loc).mtime : new Date(0);
    }
}

/**
 * A class representing a directory of files.
 */
export class Collection {
    /**
     * @param loc The location of the directory.
     * @param ext The extension of the data files in the directory.
     */
    constructor(public loc: string, public ext = ".json") {
        this.loc = path.resolve(loc);
        if (!fs.existsSync(loc)) {
            fs.mkdirSync(loc, { recursive: true });
        }
    }

    /**
     * @param name The name of the sub collection.
     * @returns Sub collection instance.
     */
    public collection(name: string): Collection {
        return new Collection(path.join(this.loc, name));
    }
    /** The alias for `collection`. */
    public c = this.collection;
    /** The alias for `collection`. */
    public dir = this.collection;

    /**
     * @param name The name of the document.
     * @returns Document instance.
     */
    public document(name: string): Document {
        return new Document(path.join(this.loc, name + this.ext));
    }
    /** The alias for `document`. */
    public d = this.document;
    /** The alias for `document`. */
    public doc = this.document;

    /**
     * List all the documents in the collection.
     * @param matcher A regular expression to match against the document name. (without extension)
     * @returns The list of documents in the collection.
     */
    public list(matcher = /[\s\S]*/): Document[] {
        const files = fs
            .readdirSync(this.loc)
            .filter((f) => f.endsWith(this.ext) && matcher.test(path.basename(f, this.ext)));
        return files.map((f) => this.document(f.replace(this.ext, "")));
    }
    /** The alias for `list`. */
    public docs = this.list;

    /**
     * List all the sub collections in the collection.
     * @param matcher A regular expression to match against the collection name.
     * @returns The list of collections in the collection.
     */
    public collections(matcher = /[\s\S]*/): Collection[] {
        const dirs = fs
            .readdirSync(this.loc)
            .filter((f) => fs.statSync(path.join(this.loc, f)).isDirectory() && matcher.test(f));
        return dirs.map((d) => this.collection(d));
    }
    /** The alias for `collections`. */
    public subs = this.collections;

    /**
     * Delete the collection.
     */
    public delete(): void {
        fs.rmSync(this.loc, { recursive: true });
    }

    /**
     * Get the size of the collection in bytes.
     */
    public get size(): number {
        let size = 0;

        for (const d of this.list()) {
            size += d.size;
        }
        for (const c of this.collections()) {
            size += c.size;
        }

        return size;
    }

    /**
     * Get the name of the collection.
     */
    public get name(): string {
        return path.basename(this.loc);
    }
}

/**
 * The alias for `Collection`.
 * Better representing the root collection.
 */
export class Store extends Collection {}

export default Store;
