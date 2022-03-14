# fs-base

File system is a good place to store data without worrying how to view, access, or move them.

```ts
import { Store } from "fs-base";

const store = new Store("path-to-store");
const coll = store.collection("collection-name");

for (let i = 0; i < 1000; i++) {
  coll
    .collection(`Collection ${i}`)
    .document("info")
    .set({
      title: `Info of Collection ${i}`,
      description: `Something...`,
      time: Date.now(),
      abcdefg: "hijklmnopqrstuvwxyz",
    });
}

const data = coll
  .collections()
  .map((c) => c.list())
  .flat()
  .map((d) => d.get());

console.log(data);
coll.delete();
```
