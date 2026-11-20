import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { Window } from "happy-dom";
import { evaluate } from "./utils.mjs";

test("export calls the public save capability, handles denial and never uses browser confirm", async () => {
  const window = new Window();
  try {
    window.document.write(readFileSync(new URL("index.html", import.meta.url), "utf8").replace(/<script[\s\S]*?<\/script>/g, ""));
    let denied = false;
    const requests = [];
    window.mytools = { onPluginReady() {}, async call(id, args) {
      requests.push({ id, args });
      if (denied) throw Error("导出授权被拒绝");
      return { cancelled: true };
    }};
    const context = vm.createContext({ window, document: window.document, localStorage: window.localStorage,
      matchMedia: window.matchMedia.bind(window), setTimeout, clearTimeout, evaluate,
      confirm: () => assert.fail("must use inline confirmation"),
    });
    vm.runInContext(readFileSync(new URL("common.mjs", import.meta.url), "utf8").replace(/export /g, ""), context);
    vm.runInContext(readFileSync(new URL("app.mjs", import.meta.url), "utf8").replace(/import[\s\S]*?from\s+"[^"]+";/g, ""), context);
    await window.document.querySelector("#export").onclick();
    assert.equal(requests[0].id, "fs.exporttext");
    assert.equal(requests[0].args.name, "计算稿纸.txt");
    assert.equal(window.document.querySelector("#status").textContent, "已取消导出");
    denied = true;
    await window.document.querySelector("#export").onclick();
    assert.match(window.document.querySelector("#status").textContent, /导出授权被拒绝/);
    assert.equal(window.document.querySelector("#status").dataset.error, "true");
  } finally { window.close(); }
});
