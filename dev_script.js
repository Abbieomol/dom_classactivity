const employees = [
  { id: 1, name: "Alice Johnson", role: "Developer", score: 88 },
  { id: 2, name: "James Smith", role: "Designer", score: 73 },
  { id: 3, name: "Fatou Kamara", role: "Project Manager", score: 91 },
  { id: 4, name: "David Mwangi", role: "QA Engineer", score: 64 },
];

const roles = ["Developer", "Designer", "Project Manager", "QA Engineer"];

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


function getVisibleEmployees() {
  const term = searchTerm.trim().toLowerCase();

  const result = employees.filter(function (employee) {
    const matchesName = employee.name.toLowerCase().includes(term);
    const matchesRole = roleFilter === "all" || employee.role === roleFilter;
    return matchesName && matchesRole;
  });

  if (sortKey) {
    result.sort(function (a, b) {
      let comparison;
      if (sortKey === "score") {
        comparison = a.score - b.score; 
      } else {
        comparison = a[sortKey].localeCompare(b[sortKey]); 
      }
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
  container.innerHTML = "";

  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");

  columns.forEach(function (col) {
    const th = document.createElement("th");
    th.textContent = col.label;

    if (col.sortable) {
      th.classList.add("sortable");

     
      if (sortKey === col.key) {
        th.classList.add("sorted");
        const arrow = document.createElement("span");
        arrow.className = "sort-arrow";
        arrow.textContent = sortDir === "asc" ? " ▲" : " ▼";
        th.appendChild(arrow);
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
  const visibleEmployees = getVisibleEmployees();

  
  if (visibleEmployees.length === 0) {
    const emptyRow = document.createElement("tr");
    const emptyCell = document.createElement("td");
    emptyCell.colSpan = columns.length;
    emptyCell.className = "empty-state";
    emptyCell.textContent = "No employees match your search or filter.";
    emptyRow.appendChild(emptyCell);
    tbody.appendChild(emptyRow);
  }

  visibleEmployees.forEach(function (employee) {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = employee.name;

    const roleCell = document.createElement("td");
    roleCell.textContent = employee.role;

    const scoreCell = document.createElement("td");
    scoreCell.textContent = employee.score;

    const actionsCell = document.createElement("td");

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn";
    editBtn.textContent = "Edit";

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn";
    deleteBtn.textContent = "Delete";

    actionsCell.appendChild(editBtn);
    actionsCell.appendChild(deleteBtn);

    row.appendChild(nameCell);
    row.appendChild(roleCell);
    row.appendChild(scoreCell);
    row.appendChild(actionsCell);
    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}


function renderRoleFilter() {
  const select = document.getElementById("role-filter");
  select.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All roles";
  select.appendChild(allOption);

  roles.forEach(function (role) {
    const option = document.createElement("option");
    option.value = role;
    option.textContent = role;
    select.appendChild(option);
  });
}


function setupFilters() {
  const searchInput = document.getElementById("search-input");
  const roleSelect = document.getElementById("role-filter");

  searchInput.addEventListener("input", function (event) {
    searchTerm = event.target.value;
    renderTable();
  });

  roleSelect.addEventListener("change", function (event) {
    roleFilter = event.target.value;
    renderTable();
  });
}

renderRoleFilter();
setupFilters();
renderTable();