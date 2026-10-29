const employees = [
  { id: 1, name: "Alice Johnson", role: "Developer", score: 88 },
  { id: 2, name: "James Smith", role: "Designer", score: 73 },
  { id: 3, name: "Fatou Kamara", role: "Project Manager", score: 91 },
  { id: 4, name: "David Mwangi", role: "QA Engineer", score: 64 },
];

const roles = ["Developer", "Designer", "Project Manager", "QA Engineer"];

function renderTable() {
  const container = document.getElementById("table-container");
  container.innerHTML = "";

  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");

  const columns = ["Name", "Role", "Score", "Actions"];
  columns.forEach(function (col) {
    const th = document.createElement("th");
    th.textContent = col;
    headRow.appendChild(th);
  });

  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  employees.forEach(function (employee) {
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

renderRoleFilter();
renderTable();
