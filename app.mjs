import {
  $,
  $$,
  action,
  copy,
  status,
  ready,
  call,
  confirmAction,
  debounce,
} from "./common.mjs";
import { evaluate } from "./utils.mjs";
let rows = [{ expression: "", note: "" }];
const save = debounce(
  action(async () => {
    await call("storage.set", { key: "paper", value: rows });
    status("稿纸已保存");
  }),
  700,
);
function render(focus = -1) {
  $("#paper").replaceChildren();
  rows.forEach((row, i) => {
    const el = document.createElement("div");
    el.className = "calc-line";
    const n = document.createElement("span");
    n.className = "line-num";
    n.textContent = String(i + 1).padStart(2, "0");
    const input = document.createElement("input");
    input.value = row.expression;
    input.placeholder = "计算公式";
    input.setAttribute("aria-label", "第 " + (i + 1) + " 行公式");
    const answer = document.createElement("button");
    answer.className = "answer";
    answer.title = "点击复制结果";
    const note = document.createElement("input");
    note.className = "note";
    note.value = row.note;
    note.placeholder = "备注说明";
    const remove = document.createElement("button");
    remove.className = "remove";
    remove.textContent = "×";
    remove.setAttribute("aria-label", "删除计算行");
    function update() {
      try {
        answer.textContent = input.value ? "= " + evaluate(input.value) : "—";
        answer.classList.remove("danger");
      } catch (e) {
        answer.textContent = "…";
        answer.classList.add("danger");
      }
    }
    input.oninput = () => {
      row.expression = input.value;
      update();
      save();
    };
    note.oninput = () => {
      row.note = note.value;
      save();
    };
    input.onkeydown = action(async (e) => {
      if (e.isComposing) return;
      if (e.key === "Enter") {
        e.preventDefault();
        const result = evaluate(input.value);
        rows.splice(i + 1, 0, { expression: String(result), note: "" });
        render(i + 1);
        save();
      } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        $$(".calc-line>input:not(.note)")[
          Math.max(
            0,
            Math.min(rows.length - 1, i + (e.key === "ArrowUp" ? -1 : 1)),
          )
        ]?.focus();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === "c" &&
        input.selectionStart === input.selectionEnd
      ) {
        e.preventDefault();
        await copy(evaluate(input.value));
      }
    });
    answer.onclick = action(() => copy(evaluate(input.value)));
    remove.onclick = () => {
      rows.splice(i, 1);
      if (!rows.length) rows.push({ expression: "", note: "" });
      render();
      save();
    };
    el.append(n, input, answer, note, remove);
    $("#paper").append(el);
    update();
  });
  if (focus >= 0) {
    const input = $$(".calc-line>input:not(.note)")[focus];
    input?.focus();
    input?.select();
  }
}
$("#add").onclick = () => {
  rows.push({ expression: "", note: "" });
  render(rows.length - 1);
  save();
};
$("#clear").onclick = action(async () => {
  if (rows.some((r) => r.expression) && !await confirmAction("清空全部计算稿纸？")) return;
  rows = [{ expression: "", note: "" }];
  render(0);
  save();
});
$("#export").onclick = action(async () => {
  const result = await call("fs.exporttext", {
    name: "计算稿纸.txt",
    content: rows
      .map((r) => {
        try {
          return (
            r.expression +
            " = " +
            evaluate(r.expression) +
            (r.note ? "  " + r.note : "")
          );
        } catch {
          return r.expression;
        }
      })
      .join("\n"),
  });
  status(result.cancelled ? "已取消导出" : "稿纸已导出");
});
render();
ready(async () => {
  const saved = await call("storage.get", { key: "paper" });
  if (Array.isArray(saved) && saved.length) {
    rows = saved
      .slice(0, 200)
      .map((r) => ({
        expression: String(r.expression || ""),
        note: String(r.note || ""),
      }));
    render();
  }
  status("稿纸自动保存 · 百分比示例：200 × 15%");
});
