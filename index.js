async function main() {
  const inquirer = require("inquirer");
  const mysql = require("mysql2/promise");

  // Connect to database

  const db = await mysql.createConnection(
    {
      host: "localhost",
      user: "root",
      password: "rootpass",
      database: "employees_db",
    },
    console.log(`Connected to the employees_db database.`)
  );

const main_menu = [
  {
    type: "list",
    name: "main_selection",
    message: "What would you like to do?",
    choices: [
      "View all departments",
      "View all roles",
      "View all employees",
      "Add a department",
      "Add a role",
      "Add an employee",
      "Update an employee role",
      "View employees by department",
      "Quit",
    ],
  },
];

//TODO: BONUS
// Update employee managers.
// View employees by manager.
// View employees by department.
// Delete departments, roles, and employees.
// View the total utilized budget of a department—in other words, the combined salaries of all employees in that department.

//function to check if user entered anything
const checkData = (data) => {
  if (data !== "") {
    return true;
  }
  return "Please enter requested data.";
};

//function to display all departments from DB
async function showAllDepartments() {
  const query =
    "SELECT department.id AS ID, department.name AS Department FROM department";

  const [rows] = await db.execute(query);
  console.table(rows);
  loadMainMenu();
}

//function to display all roles from DB
async function showAllRoles() {
  const query =
    "SELECT role.id AS ID, role.title AS Role, role.salary AS Salary, department.name AS Department FROM role JOIN department ON role.department_id = department.id ORDER BY role.id;";

  const [rows] = await db.execute(query);
  console.table(rows);
  loadMainMenu();
}

//function to display all employees from DB
async function showAllEmployees() {
  const query =
    "SELECT e.id AS ID, e.first_name AS FirstName, e.last_name as LastName, r.title AS Role, r.salary AS Salary, d.name AS Department, CONCAT(m.first_name, ' ',m.last_name) AS Manager FROM employee e LEFT JOIN role r ON e.role_id = r.id LEFT JOIN department d ON r.department_id = d.id LEFT JOIN employee m ON e.manager_id = m.id;";

  const [rows] = await db.execute(query);
  console.table(rows);
  loadMainMenu();
}

//function to add a new department
async function addDepartment() {
  const question = [
    {
      type: "input",
      name: "department_name",
      message: "Please enter department name you would like to add:",
      validate: checkData,
    },
  ];

  inquirer.prompt(question).then(async (answer) => {
    const newDepartment = answer.department_name;
    await db.execute(`INSERT INTO department (name) VALUES (?);`, [
      newDepartment,
    ]);
    console.table(`Department ${newDepartment} was successfully added!`);
    loadMainMenu();
  });
}

//function to add a new role
async function addRole() {
  //getting list of all departments to select for new role
  const [rows] = await db.execute("SELECT name FROM department");
  const departmentList = rows.map((department) => department.name);

  const questions = [
    {
      type: "input",
      name: "role_title",
      message: "Please enter role title:",
      validate: checkData,
    },
    {
      type: "input",
      name: "role_salary",
      message: "Please enter salary for this role:",
      validate: checkData,
    },
    {
      type: "list",
      name: "role_department_name",
      message: "Please select department for this role:",
      choices: departmentList,
    },
  ];

  inquirer.prompt(questions).then(async (answers) => {
    const roleTitle = answers.role_title;
    const roleSalary = answers.role_salary;
    const departmentSelected = answers.role_department_name;

    const [deptID] = await db.execute(
      `SELECT id FROM department WHERE name = ?;`,
      [departmentSelected]
    );

    const id = deptID.map((a) => a.id)[0];

    await db.execute(
      `INSERT INTO role (title, salary, department_id) VALUES(?, ?, ?);`,
      [roleTitle, roleSalary, id]
    );

    console.log(`Role ${roleTitle} was successfully Added!`);

    loadMainMenu();
  });
}

//function to add a new employee
async function addEmployee() {
  //getting list of all available roles
  const [roles] = await db.execute("SELECT title FROM role");
  const roleList = roles.map((a) => a.title);

  //getting list of all employees for a manager role
  const [managers] = await db.execute(
    "SELECT CONCAT(first_name,' ',last_name) AS full_name FROM employee"
  );
  const managerList = managers.map((a) => a.full_name);

  let updatedManagerList = ["None"];
  for (let i = 0; i < managerList.length; i++) {
    updatedManagerList.push(managerList[i]);
  }

  const questions = [
    {
      type: "input",
      name: "first_name_input",
      message: "Please enter new employee First Name:",
      validate: checkData,
    },
    {
      type: "input",
      name: "last_name_input",
      message: "Please enter new employee Last Name:",
      validate: checkData,
    },

    {
      type: "list",
      name: "role_input",
      message: "Please select new employee role:",
      choices: roleList,
    },

    {
      type: "list",
      name: "employee_manager",
      message: "Please select new employee manage:",
      choices: updatedManagerList,
    },
  ];

  inquirer.prompt(questions).then(async (answers) => {
    const firstName = answers.first_name_input;
    const lastName = answers.last_name_input;
    const roleSelected = answers.role_input;

    let manId;
    const managerSelected = answers.employee_manager;

    //checking if no manager, then assigning null to manager id
    if (managerSelected === "None") {
      manId = null;
    } else {
      const managerArr = managerSelected.split(" ");
      const managerFirstName = managerArr[0];
      const managerLastName = managerArr[1];

      //getting manager employee ID based on first name and last name
      const [managerID] = await db.execute(
        `SELECT id FROM employee WHERE first_name = ? AND last_name = ?;`,
        [managerFirstName, managerLastName]
      );
      manId = managerID.map((a) => a.id)[0];
    }

    //getting role ID based on selected role
    const [roleID] = await db.execute(`SELECT id FROM role WHERE title = ?;`, [
      roleSelected,
    ]);
    const rId = roleID.map((a) => a.id)[0];

    //adding data into database, employee table
    await db.execute(
      `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES(?, ?, ?, ?);`,
      [firstName, lastName, rId, manId]
    );

    console.log(
      `New employee ${firstName} ${lastName} was successfully added!`
    );

    loadMainMenu();
  });
}

//function to update employee role
async function updateEmployeeRole() {
  //getting list of all employees
  const [employees] = await db.execute(
    "SELECT CONCAT(first_name,' ',last_name) AS full_name FROM employee"
  );
  const employeeList = employees.map((a) => a.full_name);

  //getting list of all available roles
  const [roles] = await db.execute("SELECT title FROM role");
  const roleList = roles.map((a) => a.title);

  const questions = [
    {
      type: "list",
      name: "full_name_input",
      message: "Please select employee you would like to update:",
      choices: employeeList,
    },
    {
      type: "list",
      name: "new_role_input",
      message: "Please select new role for this employee:",
      choices: roleList,
    },
  ];

  inquirer.prompt(questions).then(async (answers) => {
    const fullName = answers.full_name_input.split(" ");
    const firstName = fullName[0];
    const lastName = fullName[1];

    const newRoleSelected = answers.new_role_input;

    //getting employee ID based on fist name and last name
    const [employeeID] = await db.execute(
      `SELECT id FROM employee WHERE first_name = ? AND last_name = ?;`,
      [firstName, lastName]
    );
    const emplId = employeeID.map((a) => a.id)[0];

    //getting role ID based on selected role
    const [roleID] = await db.execute(`SELECT id FROM role WHERE title = ?;`, [
      newRoleSelected,
    ]);
    const rId = roleID.map((a) => a.id)[0];

    //updating role id in employee table for that employee
    await db.execute(`UPDATE employee SET role_id = ? WHERE id = ?;`, [
      rId,
      emplId,
    ]);

    console.log(
      `Employee ${firstName} ${lastName} role was updated to ${newRoleSelected}!`
    );

    loadMainMenu();
  });
}

async function viewEmployeesByDepartment() {
  //getting list of all departments to select for new role
  const [rows] = await db.execute("SELECT name FROM department");
  const departmentList = rows.map((department) => department.name);

  const questions = [{
      type: "list",
      name: "department_name",
      message: "Please select department you would like to view employees for:",
      choices: departmentList,
    },
  ];

  inquirer.prompt(questions).then(async (answers) => {
    const departmentSelected = answers.department_name;

    const [deptID] = await db.execute(
      `SELECT id FROM department WHERE name = ?;`,
      [departmentSelected]
    );
    const id = deptID.map((a) => a.id)[0];

    const [rows] = await db.execute(
      "SELECT CONCAT(e.first_name, ' ', e.last_name) as Employee, d.name AS Department FROM employee e LEFT JOIN role r ON e.role_id = r.id LEFT JOIN department d ON r.department_id = d.id WHERE d.id = ?;", [id]
    );

    console.table(rows);

    console.log(
      `Showing employees from ${departmentSelected} department!`
    );

    loadMainMenu();
  });
}

function loadMainMenu() {
  inquirer.prompt(main_menu).then((answer) => {
    switch (answer.main_selection) {
      case "View all departments":
        showAllDepartments();
        break;
      case "View all roles":
        showAllRoles();
        break;
      case "View all employees":
        showAllEmployees();
        break;
      case "Add a department":
        addDepartment();
        break;
      case "Add a role":
        addRole();
        break;
      case "Add an employee":
        addEmployee();
        break;
      case "Update an employee role":
        updateEmployeeRole();
        break;
      case "View employees by department":
        viewEmployeesByDepartment();
        break;
      case "Quit":
        console.log("Thank you for using Employee Tracker!");
        process.exit(1);
        break;
    }
  });
}

console.log("");
console.log(" ______________________________");
console.log("|                              |");
console.log("| Welcome to Employee Tracker! |");
console.log("|                              |");
console.log("|______________________________|");
console.log("");

loadMainMenu();
}

main();