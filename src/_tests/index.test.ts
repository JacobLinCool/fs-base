import { Store } from "../";

describe("Store", () => {
    const store = new Store("tmp-" + Date.now());
    store.delete();

    afterAll(() => {
        store.delete();
    });

    test("create collections", () => {
        for (let i = 0; i < 10; i++) {
            store.c("test-" + i);
        }
        expect(store.collections().length).toBe(10);
    });

    test("write document in collections", () => {
        store.collections().forEach((c) => {
            c.d("test").set({
                parent: c.name,
                description: `test file in ${c.name}`,
            });
        });
        expect(store.collections().map((c) => c.docs().length)).toEqual([
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        ]);
    });

    test("get document in collections", () => {
        store.collections().forEach((c) => {
            expect(c.d("test").get()).toEqual({
                parent: c.name,
                description: `test file in ${c.name}`,
            });
        });
    });

    test("delete document in collections", () => {
        store.collections().forEach((c) => {
            c.d("test").delete();
        });
        expect(store.collections().map((c) => c.docs().length)).toEqual([
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ]);
    });

    test("delete collections", () => {
        store.collections().forEach((c) => {
            c.delete();
        });
        expect(store.collections().length).toBe(0);
    });

    test("get not exists document", () => {
        expect(store.c("t").c("e").c("s").c("t").d("test").get()).toEqual(null);
    });

    test("document size", () => {
        const doc = store.c("test").d("test");
        doc.set({ id: 123, name: "test" });
        expect(doc.size).toBe(JSON.stringify(doc.get()).length);
        expect(store.c("test").d("test2").size).toBe(0);
    });

    test("document exists", () => {
        const doc = store.c("test").d("test");
        doc.set({ id: 123, name: "test" });
        expect(doc.exists).toBe(true);
        expect(store.c("test").d("test2").exists).toBe(false);
    });

    test("document modified", () => {
        const doc = store.c("test").d("test");
        doc.set({ id: 123, name: "test" });
        expect(doc.modified > new Date(0)).toBe(true);
        expect(store.c("test").d("test2").modified).toEqual(new Date(0));
    });

    test("collection size", () => {
        store.delete();
        for (let i = 0; i < 100; i++) {
            store
                .c("test-" + i)
                .d("test")
                .set({ content: 123456789 });
        }

        expect(store.size).toBe(2100);
    });
});
