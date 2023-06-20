const inquirer = require("inquirer");
const mysql = require("mysql2");

// Connect to database
const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "rootpass",
    database: "employees_db",
  }
  //console.log(`Connected to the employees_db database.`)
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
      "Quit",
    ],
  },
];

function showAllDepartments() {
  db.query(
    "SELECT department.id AS ID, department.name AS Department FROM department",
    function (err, results) {
      console.table(results);
      loadMainMenu();
    }
  );
}

function showAllRoles() {
  db.query(
    "SELECT role.id AS ID, role.title AS Role, role.salary AS Salary, department.name AS Department FROM role JOIN department ON role.department_id = department.id ORDER BY role.id;",
    function (err, results) {
      console.table(results);
      // console.table();
      loadMainMenu();
    }
  );
}

function showAllEmployees() {
  db.query(
    "SELECT e.id AS ID, e.first_name AS FirstName, e.last_name as LastName, r.title AS Role, r.salary AS Salary, d.name AS Department, CONCAT(m.first_name, ' ',m.last_name) AS Manager FROM employee e LEFT JOIN role r ON e.role_id = r.id LEFT JOIN department d ON r.department_id = d.id LEFT JOIN employee m ON e.manager_id = m.id;",

    function (err, results) {
      console.table(results);
      loadMainMenu();
    }
  );
}

function addDepartment() {
  const question = [
    {
      type: "input",
      name: "department_name",
      message: "Please enter department name you would like to add:",
    },
  ];
  inquirer.prompt(question).then((answer) => {
    const newDepartment = answer.department_name;

    db.query(
      `INSERT INTO department (name) VALUES ("${newDepartment}");`,
      function (err, results) {
        console.log(`Department ${newDepartment} was successfully added!`);
        loadMainMenu();
      }
    );
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
