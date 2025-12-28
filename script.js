// ========== 小工具：安全取用 localStorage ==========
const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }
};

// ========== 主題切換 ==========
const themeBtn = document.getElementById("themeBtn");
const root = document.documentElement;

function applyTheme(theme) {
  root.dataset.theme = theme;
  const pressed = theme === "light";
  themeBtn.setAttribute("aria-pressed", String(pressed));
}

const savedTheme = store.get("theme", "dark");
applyTheme(savedTheme);

themeBtn.addEventListener("click", () => {
  const current = root.dataset.theme || "dark";
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  store.set("theme", next);
});

// ========== 本機瀏覽次數 ==========
const visitCountEl = document.getElementById("visitCount");
const visits = store.get("visits", 0) + 1;
store.set("visits", visits);
visitCountEl.textContent = String(visits);

// ========== 時鐘 ==========
const clockEl = document.getElementById("clock");
function tick() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  clockEl.textContent = `${hh}:${mm}:${ss}`;
}
tick();
setInterval(tick, 1000);

// ========== 年份 ==========
document.getElementById("year").textContent = String(new Date().getFullYear());

// ========== 專案搜尋 ==========
const projectSearch = document.getElementById("projectSearch");
const projectList = document.getElementById("projectList");
const noResult = document.getElementById("noResult");

function filterProjects(q) {
  const query = q.trim().toLowerCase();
  const cards = [...projectList.querySelectorAll(".project")];

  let shown = 0;
  cards.forEach(card => {
    const text = (card.innerText + " " + (card.dataset.tags || "")).toLowerCase();
    const match = query === "" || text.includes(query);
    card.hidden = !match;
    if (match) shown++;
  });

  noResult.hidden = shown !== 0;
}

projectSearch.addEventListener("input", (e) => {
  filterProjects(e.target.value);
});

// ========== 待辦清單 ==========
const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const clearBtn = document.getElementById("clearBtn");

let todos = store.get("todos", []); // {id, text, done}

function renderTodos() {
  todoList.innerHTML = "";

  if (!todos.length) {
    const li = document.createElement("li");
    li.className = "muted";
    li.textContent = "目前沒有待辦事項。";
    todoList.appendChild(li);
    return;
  }

  todos.forEach(item => {
    const li = document.createElement("li");
    li.className = "todo-item";

    const left = document.createElement("div");
    left.className = "todo-left";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = item.done;
    cb.addEventListener("change", () => {
      todos = todos.map(t => t.id === item.id ? { ...t, done: cb.checked } : t);
      store.set("todos", todos);
      renderTodos();
    });

    const text = document.createElement("div");
    text.className = "todo-text" + (item.done ? " done" : "");
    text.textContent = item.text;

    left.appendChild(cb);
    left.appendChild(text);

    const del = document.createElement("button");
    del.className = "icon-btn";
    del.type = "button";
    del.textContent = "刪除";
    del.addEventListener("click", () => {
      todos = todos.filter(t => t.id !== item.id);
      store.set("todos", todos);
      renderTodos();
    });

    li.appendChild(left);
    li.appendChild(del);
    todoList.appendChild(li);
  });
}

renderTodos();

todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;

  const item = {
    id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
    text,
    done: false
  };

  todos = [item, ...todos];
  store.set("todos", todos);
  todoInput.value = "";
  renderTodos();
});

clearBtn.addEventListener("click", () => {
  todos = [];
  store.set("todos", todos);
  renderTodos();
});

// ========== 聯絡表單（前端示範） ==========
const contactForm = document.getElementById("contactForm");
const formHint = document.getElementById("formHint");

contactForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = contactForm.name.value.trim();
  const email = contactForm.email.value.trim();
  const message = contactForm.message.value.trim();

  if (!name || !email || !message) {
    formHint.textContent = "請把欄位填完整。";
    return;
  }

  // 示範：假裝送出成功
  formHint.textContent = "已送出（示範）。你可以在 script.js 這裡接後端或 Email 服務。";
  contactForm.reset();

  // 3 秒後清除提示
  setTimeout(() => (formHint.textContent = ""), 3000);
});
