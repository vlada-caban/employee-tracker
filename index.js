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
  db.query("SELECT * FROM department", function (err, results) {
    console.log(results);
    loadMainMenu();
  });
}

function showAllRoles() {
  db.query("SELECT * FROM role", function (err, results) {
    console.log(results);
    loadMainMenu();
  });
}

function showAllEmployees() {
  db.query("SELECT * FROM employee", function (err, results) {
    console.log(results);
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
      case "Quit":
        console.log("Thank you for using Employee Tracker!");
        process.exit(1);
        break;

    }
  });
}

console.log("Welcome to Employee Tracker!");
loadMainMenu();
