// InsightFlow JS Employee Dashboard
const employees = [
  { id: 1, name: "Alice Johnson", role: "Developer", score: 88 },
  { id: 2, name: "James Smith", role: "Designer", score: 73 },
  { id: 3, name: "Fatou Kamara", role: "Project Manager", score: 91 },
  { id: 4, name: "David Mwangi", role: "QA Engineer", score: 64 }
];

let nextId = Math.max(...employees.map(e => e.id)) + 1;
let sortKey = null;        
let sortDir = "asc";       
let searchTerm = "";
let roleFilter = "all";

const COLUMNS = [
  { key: "name",    label: "Name",    sortable: true },
  { key: "role",    label: "Role",    sortable: true },
  { key: "score",   label: "Score",   sortable: true },
  { key: "actions", label: "Actions", sortable: false }
];


function clearElement(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function createEl(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function getScoreClass(score) {
  if (score >= 85) return "row-high";
  if (score >= 70) return "row-mid";
  return "row-low";
}

function getUniqueRoles() {
  return [...new Set(employees.map(e => e.role))].sort((a, b) => a.localeCompare(b));
}

// available data filtering
function getVisibleEmployees() {
  const term = searchTerm.trim().toLowerCase();

  let result = employees.filter(emp => {
    const matchesName = emp.name.toLowerCase().includes(term);
    const matchesRole = roleFilter === "all" || emp.role === roleFilter;
    return matchesName && matchesRole;
  });

  if (sortKey) {
    result = result.slice().sort((a, b) => {
      let cmp;
      if (sortKey === "score") {
        cmp = a.score - b.score;
      } else {
        cmp = a[sortKey].localeCompare(b[sortKey]);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }
  return result;
}

function setSort(key) {
  if (sortKey === key) {
    sortDir = sortDir === "asc" ? "desc" : "asc";
  } else {
    sortKey = key;
    sortDir = "asc";
  }
  renderTable();
}

function renderTable() {
  const container = document.getElementById("table-container");
  clearElement(container);

  const table = createEl("table", "emp-table");

  // Header
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  COLUMNS.forEach(col => {
    const th = createEl("th", "", col.label);
    if (col.sortable) {
      th.classList.add("sortable");
      th.tabIndex = 0;
      if (sortKey === col.key) {
        th.classList.add("sorted");
        th.setAttribute("aria-sort", sortDir === "asc" ? "ascending" : "descending");
        th.appendChild(createEl("span", "sort-arrow", sortDir === "asc" ? "▲" : "▼"));
      }
      th.addEventListener("click", () => setSort(col.key));
      th.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setSort(col.key);
        }
      });
    }
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  // Body
  const tbody = document.createElement("tbody");
  const rows = getVisibleEmployees();

  if (rows.length === 0) {
    const tr = document.createElement("tr");
    const td = createEl("td", "empty-state", "No employees match your search or filter.");
    td.colSpan = COLUMNS.length;
    tr.appendChild(td);
    tbody.appendChild(tr);
  }

  rows.forEach(emp => {
    const tr = document.createElement("tr");
    tr.classList.add(getScoreClass(emp.score));   

    tr.appendChild(createEl("td", "", emp.name));
    tr.appendChild(createEl("td", "", emp.role));
    tr.appendChild(createEl("td", "", String(emp.score)));

    const actionsTd = createEl("td", "actions");

    const editBtn = createEl("button", "btn btn-edit", "Edit");
    editBtn.type = "button";
    editBtn.addEventListener("click", () => openEditModal(emp.id));

    const deleteBtn = createEl("button", "btn btn-delete", "Delete");
    deleteBtn.type = "button";
    deleteBtn.addEventListener("click", () => deleteEmployee(emp.id));

    actionsTd.appendChild(editBtn);
    actionsTd.appendChild(deleteBtn);
    tr.appendChild(actionsTd);

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}

// filter 
function renderRoleFilter() {
  const select = document.getElementById("role-filter");
  const roles = getUniqueRoles();


  if (roleFilter !== "all" && !roles.includes(roleFilter)) roleFilter = "all";

  clearElement(select);

  const allOpt = createEl("option", "", "All roles");
  allOpt.value = "all";
  select.appendChild(allOpt);

  roles.forEach(role => {
    const opt = createEl("option", "", role);
    opt.value = role;
    select.appendChild(opt);
  });

  select.value = roleFilter;
}

// summary
function updateSummary() {
  const summary = document.getElementById("summary");
  clearElement(summary);

  const total = employees.length;
  let average = "—";
  let top = "—";

  if (total > 0) {
    const sum = employees.reduce((acc, e) => acc + e.score, 0);
    average = (sum / total).toFixed(1);
    const best = employees.reduce((a, b) => (b.score > a.score ? b : a));
    top = `${best.name} (${best.score})`;
  }

  const stats = [
    { label: "Total Employees", value: String(total) },
    { label: "Average Score", value: average },
    { label: "Top Performer", value: top }
  ];

  stats.forEach(stat => {
    const card = createEl("div", "stat-card");
    card.appendChild(createEl("div", "label", stat.label));
    card.appendChild(createEl("div", "value", stat.value));
    summary.appendChild(card);
  });
}

// re-sync after data changes
function refresh() {
  renderRoleFilter();
  renderTable();
  updateSummary();
}

// Employee Validation
function validateEmployee(values, { requireName }) {
  const errors = {};

  if (requireName && values.name.trim() === "") {
    errors.name = "Name is required.";
  }
  if (values.role.trim() === "") {
    errors.role = "Role is required.";
  }

  const rawScore = values.score.trim();
  const score = Number(rawScore);
  if (rawScore === "" || Number.isNaN(score)) {
    errors.score = "Score must be a number.";
  } else if (score < 0 || score > 100) {
    errors.score = "Score must be between 0 and 100.";
  }

  return errors;
}

// The Modal
function closeModal() {
  const root = document.getElementById("modal-root");
  clearElement(root);
}

function openModal({ title, fields, values = {}, submitLabel, validate, onSubmit }) {
  closeModal();
  const root = document.getElementById("modal-root");

  const overlay = createEl("div", "modal-overlay");
  // Clicking the overlayncloses it
  overlay.addEventListener("mousedown", e => {
    if (e.target === overlay) closeModal();
  });

  const modal = createEl("div", "modal");
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.appendChild(createEl("h2", "", title));

  const form = document.createElement("form");
  form.noValidate = true;

  const inputs = {};
  const errorEls = {};

  fields.forEach(f => {
    const wrap = createEl("div", "field");
    const label = createEl("label", "", f.label);
    const inputId = `field-${f.key}`;
    label.htmlFor = inputId;

    const input = document.createElement("input");
    input.id = inputId;
    input.type = f.type || "text";
    input.value = values[f.key] !== undefined ? values[f.key] : "";
    if (f.type === "number") {
      input.min = "0";
      input.max = "100";
      input.step = "any";
    }
    if (f.listId) input.setAttribute("list", f.listId);

    const error = createEl("div", "error");

    inputs[f.key] = input;
    errorEls[f.key] = error;

    wrap.appendChild(label);
    wrap.appendChild(input);
    wrap.appendChild(error);
    form.appendChild(wrap);
  });

  const datalist = document.createElement("datalist");
  datalist.id = "role-options";
  getUniqueRoles().forEach(role => {
    const opt = document.createElement("option");
    opt.value = role;
    datalist.appendChild(opt);
  });
  form.appendChild(datalist);

  const actions = createEl("div", "modal-actions");
  const cancelBtn = createEl("button", "btn btn-secondary", "Cancel");
  cancelBtn.type = "button";
  cancelBtn.addEventListener("click", closeModal);
  const saveBtn = createEl("button", "btn btn-primary", submitLabel);
  saveBtn.type = "submit";
  actions.appendChild(cancelBtn);
  actions.appendChild(saveBtn);
  form.appendChild(actions);

  form.addEventListener("submit", e => {
    e.preventDefault();

    const submitted = {};
    fields.forEach(f => { submitted[f.key] = inputs[f.key].value; });

    const errors = validate(submitted);


    fields.forEach(f => {
      const msg = errors[f.key] || "";
      errorEls[f.key].textContent = msg;
      inputs[f.key].classList.toggle("invalid", Boolean(msg));
    });

    if (Object.keys(errors).length > 0) return;

    onSubmit(submitted);
    closeModal();
  });

  modal.appendChild(form);
  overlay.appendChild(modal);
  root.appendChild(overlay);


  const firstKey = fields[0].key;
  inputs[firstKey].focus();
}

// ---------- Actions: edit / add / delete ----------
function openEditModal(id) {
  const emp = employees.find(e => e.id === id);
  if (!emp) return;

  openModal({
    title: `Edit ${emp.name}`,
    fields: [
      { key: "role",  label: "Role",  type: "text", listId: "role-options" },
      { key: "score", label: "Score (0-100)", type: "number" }
    ],
    values: { role: emp.role, score: String(emp.score) },
    submitLabel: "Save Changes",
    validate: values => validateEmployee(values, { requireName: false }),
    onSubmit: values => {
      emp.role = values.role.trim();      // modifies the underlying array
      emp.score = Number(values.score);
      refresh();
    }
  });
}

function openAddModal() {
  openModal({
    title: "Add Employee",
    fields: [
      { key: "name",  label: "Name",  type: "text" },
      { key: "role",  label: "Role",  type: "text", listId: "role-options" },
      { key: "score", label: "Score (0-100)", type: "number" }
    ],
    submitLabel: "Add Employee",
    validate: values => validateEmployee(values, { requireName: true }),
    onSubmit: values => {
      employees.push({
        id: nextId++,
        name: values.name.trim(),
        role: values.role.trim(),
        score: Number(values.score)
      });
      refresh();
    }
  });
}

function deleteEmployee(id) {
  const index = employees.findIndex(e => e.id === id);
  if (index === -1) return;
  employees.splice(index, 1);   
  refresh();                    
}

function init() {
  document.getElementById("search-input").addEventListener("input", e => {
    searchTerm = e.target.value;
    renderTable();
  });

  document.getElementById("role-filter").addEventListener("change", e => {
    roleFilter = e.target.value;
    renderTable();
  });

  document.getElementById("add-btn").addEventListener("click", openAddModal);

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
  });

  refresh();
}

document.addEventListener("DOMContentLoaded", init);