const employees = [
  { id: 1, name: "Alice Johnson", role: "Developer", score: 88 },
  { id: 2, name: "James Smith", role: "Designer", score: 73 },
  { id: 3, name: "Fatou Kamara", role: "Project Manager", score: 91 },
  { id: 4, name: "David Mwangi", role: "QA Engineer", score: 64 },
];

let nextId = Math.max(...employees.map(function (e) { return e.id; })) + 1;
let sortKey = null;
let sortDir = "asc";
let searchTerm = "";
let roleFilter = "all";

const columns = [
  { key: "name", label: "Name", sortable: true },
  { key: "role", label: "Role", sortable: true },
  { key: "score", label: "Score", sortable: true },
  { key: "actions", label: "Actions", sortable: false },
];

function createEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

function clearEl(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

function getScoreClass(score) {
  if (score >= 85) return "row-high";
  if (score >= 70) return "row-mid";
  return "row-low";
}

function getRoles() {
  const unique = [];
  employees.forEach(function (e) {
    if (!unique.includes(e.role)) unique.push(e.role);
  });
  return unique.sort(function (a, b) { return a.localeCompare(b); });
}

function getVisibleEmployees() {
  const term = searchTerm.trim().toLowerCase();

  const result = employees.filter(function (e) {
    const matchesName = e.name.toLowerCase().includes(term);
    const matchesRole = roleFilter === "all" || e.role === roleFilter;
    return matchesName && matchesRole;
  });

  if (sortKey) {
    result.sort(function (a, b) {
      const comparison =
        sortKey === "score"
          ? a.score - b.score
          : a[sortKey].localeCompare(b[sortKey]);
      return sortDir === "asc" ? comparison : -comparison;
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
  clearEl(container);

  const table = createEl("table");
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");

  columns.forEach(function (col) {
    const th = createEl("th", "", col.label);

    if (col.sortable) {
      th.classList.add("sortable");
      if (sortKey === col.key) {
        th.classList.add("sorted");
        th.appendChild(createEl("span", "sort-arrow", sortDir === "asc" ? " ▲" : " ▼"));
      }
      th.addEventListener("click", function () {
        setSort(col.key);
      });
    }

    headRow.appendChild(th);
  });

  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  const visible = getVisibleEmployees();

  if (visible.length === 0) {
    const emptyRow = document.createElement("tr");
    const emptyCell = createEl("td", "empty-state", "No employees match your search or filter.");
    emptyCell.colSpan = columns.length;
    emptyRow.appendChild(emptyCell);
    tbody.appendChild(emptyRow);
  }

  visible.forEach(function (employee) {
    const row = createEl("tr");
    row.classList.add(getScoreClass(employee.score));

    row.appendChild(createEl("td", "", employee.name));
    row.appendChild(createEl("td", "", employee.role));
    row.appendChild(createEl("td", "", String(employee.score)));

    const actionsCell = createEl("td", "actions");

    const editBtn = createEl("button", "btn btn-edit", "Edit");
    editBtn.type = "button";
    editBtn.addEventListener("click", function () {
      openEditModal(employee.id);
    });

    const deleteBtn = createEl("button", "btn btn-delete", "Delete");
    deleteBtn.type = "button";
    deleteBtn.addEventListener("click", function () {
      deleteEmployee(employee.id);
    });

    actionsCell.appendChild(editBtn);
    actionsCell.appendChild(deleteBtn);
    row.appendChild(actionsCell);
    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}

function renderRoleFilter() {
  const select = document.getElementById("role-filter");
  const available = getRoles();

  if (roleFilter !== "all" && !available.includes(roleFilter)) {
    roleFilter = "all";
  }

  clearEl(select);

  const allOption = createEl("option", "", "All roles");
  allOption.value = "all";
  select.appendChild(allOption);

  available.forEach(function (role) {
    const option = createEl("option", "", role);
    option.value = role;
    select.appendChild(option);
  });

  select.value = roleFilter;
}

function updateSummary() {
  const summary = document.getElementById("summary");
  clearEl(summary);

  const total = employees.length;
  let average = "—";
  let top = "—";

  if (total > 0) {
    const sum = employees.reduce(function (acc, e) { return acc + e.score; }, 0);
    average = (sum / total).toFixed(1);
    top = employees.reduce(function (best, e) {
      return e.score > best.score ? e : best;
    }).name;
  }

  const stats = [
    { label: "Total Employees", value: String(total) },
    { label: "Average Score", value: average },
    { label: "Top Performer", value: top },
  ];

  stats.forEach(function (stat) {
    const card = createEl("div", "stat-card");
    card.appendChild(createEl("div", "stat-label", stat.label));
    card.appendChild(createEl("div", "stat-value", stat.value));
    summary.appendChild(card);
  });
}

function refresh() {
  renderRoleFilter();
  renderTable();
  updateSummary();
}

function validateEmployee(values, requireName) {
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

function closeModal() {
  clearEl(document.getElementById("modal-root"));
}

function openModal(config) {
  closeModal();

  const overlay = createEl("div", "modal-overlay");
  overlay.addEventListener("mousedown", function (event) {
    if (event.target === overlay) closeModal();
  });

  const modal = createEl("div", "modal");
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.appendChild(createEl("h2", "", config.title));

  const form = document.createElement("form");
  form.noValidate = true;

  const inputs = {};
  const errorEls = {};

  config.fields.forEach(function (field) {
    const wrapper = createEl("div", "field");

    const label = createEl("label", "", field.label);
    label.htmlFor = "field-" + field.key;

    let control;

    if (field.type === "select") {
      control = document.createElement("select");
      control.id = "field-" + field.key;

      (field.options || []).forEach(function (optionValue) {
        const option = document.createElement("option");
        option.value = optionValue;
        option.textContent = optionValue;
        control.appendChild(option);
      });

      control.value = config.values && config.values[field.key] !== undefined ? config.values[field.key] : "";
    } else {
      control = document.createElement("input");
      control.id = "field-" + field.key;
      control.type = field.type;
      control.value = config.values && config.values[field.key] !== undefined ? config.values[field.key] : "";

      if (field.type === "number") {
        control.min = "0";
        control.max = "100";
        control.step = "any";
      }
    }

    const error = createEl("div", "error");

    inputs[field.key] = control;
    errorEls[field.key] = error;

    wrapper.appendChild(label);
    wrapper.appendChild(control);
    wrapper.appendChild(error);
    form.appendChild(wrapper);
  });

  const actions = createEl("div", "modal-actions");

  const cancelBtn = createEl("button", "btn btn-secondary", "Cancel");
  cancelBtn.type = "button";
  cancelBtn.addEventListener("click", closeModal);

  const saveBtn = createEl("button", "btn btn-primary", config.submitLabel);
  saveBtn.type = "submit";

  actions.appendChild(cancelBtn);
  actions.appendChild(saveBtn);
  form.appendChild(actions);

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const submitted = {};
    config.fields.forEach(function (field) {
      submitted[field.key] = inputs[field.key].value;
    });

    const errors = config.validate(submitted);

    config.fields.forEach(function (field) {
      const message = errors[field.key] || "";
      errorEls[field.key].textContent = message;
      inputs[field.key].classList.toggle("invalid", message !== "");
    });

    if (Object.keys(errors).length > 0) return;

    config.onSubmit(submitted);
    closeModal();
  });

  modal.appendChild(form);
  overlay.appendChild(modal);
  document.getElementById("modal-root").appendChild(overlay);

  inputs[config.fields[0].key].focus();
}

function openEditModal(id) {
  const employee = employees.find(function (e) { return e.id === id; });
  if (!employee) return;

  openModal({
    title: "Edit " + employee.name,
    fields: [
      { key: "role", label: "Role", type: "select", options: getRoles() },
      { key: "score", label: "Score (0-100)", type: "number" },
    ],
    values: { role: employee.role, score: String(employee.score) },
    submitLabel: "Save Changes",
    validate: function (values) {
      return validateEmployee(values, false);
    },
    onSubmit: function (values) {
      employee.role = values.role.trim();
      employee.score = Number(values.score);
      refresh();
    },
  });
}

function openAddModal() {
  openModal({
    title: "Add Employee",
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "role", label: "Role", type: "select", options: getRoles() },
      { key: "score", label: "Score (0-100)", type: "number" },
    ],
    submitLabel: "Add Employee",
    validate: function (values) {
      return validateEmployee(values, true);
    },
    onSubmit: function (values) {
      employees.push({
        id: nextId++,
        name: values.name.trim(),
        role: values.role.trim(),
        score: Number(values.score),
      });
      refresh();
    },
  });
}

function deleteEmployee(id) {
  const index = employees.findIndex(function (e) { return e.id === id; });
  if (index === -1) return;
  employees.splice(index, 1);
  refresh();
}

function init() {
  document.getElementById("search-input").addEventListener("input", function (event) {
    searchTerm = event.target.value;
    renderTable();
  });

  document.getElementById("role-filter").addEventListener("change", function (event) {
    roleFilter = event.target.value;
    renderTable();
  });

  document.getElementById("add-btn").addEventListener("click", openAddModal);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeModal();
  });

  refresh();
}

document.addEventListener("DOMContentLoaded", init);