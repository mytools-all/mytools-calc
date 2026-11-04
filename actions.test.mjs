import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { evaluate } from "./utils.mjs";

test("export uses the host save dialog and reports cancellation", async () => {
  const elements = new Map();
  const element = () => ({value:"",classList:{add(){},remove(){}},setAttribute(){},append(){},replaceChildren(){}});
  const $ = key => { if (!elements.has(key)) elements.set(key, element()); return elements.get(key); };
  const requests = [];
  const messages = [];
  let cancelled = false;
  const source = (await readFile(new URL("app.mjs", import.meta.url), "utf8")).replace(/import[\s\S]*?from\s+"[^"]+";/g, "");
  vm.runInNewContext(source, {$,$$:()=>[],evaluate,document:{createElement:element},debounce:fn=>fn,action:fn=>fn,ready(){},copy(){},confirmAction:async()=>false,status:text=>messages.push(text),call:async(id,args)=>{requests.push({id,args});return {cancelled};}});
  await $("#export").onclick();
  assert.equal(requests[0].id, "fs.exporttext");
  assert.equal(requests[0].args.name, "计算稿纸.txt");
  assert.equal(typeof requests[0].args.content, "string");
  assert.equal(messages.at(-1), "稿纸已导出");
  cancelled = true;
  await $("#export").onclick();
  assert.equal(messages.at(-1), "已取消导出");
});
