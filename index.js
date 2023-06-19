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
    "SELECT role.id AS ID, role.title AS Role, role.salary AS Salary, department.name AS Department FROM role INNER JOIN department ON role.department_id = department.id ORDER BY role.id;",
    function (err, results) {
      console.table(results);
      // console.table();
      loadMainMenu();
    }
  );
}

function showAllEmployees() {
  db.query(
    "SELECT employee.id AS ID, employee.first_name AS FirstName, employee.last_name as LastName, role.title AS Role, employee.manager_id FROM employee INNER JOIN role ON employee.role_id = role.id;",
    
    function (err, results) {
      console.table(results);
      loadMainMenu();
    }
  );
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
      case "Quit":
        console.log("Thank you for using Employee Tracker!");
        process.exit(1);
        break;
    }
  });
}

console.log("Welcome to Employee Tracker!");
loadMainMenu();
