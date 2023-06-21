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
        "Quit",
      ],
    },
  ];

  async function showAllDepartments() {
    // db.query(
    //   "SELECT department.id AS ID, department.name AS Department FROM department",
    //   function (err, results) {
    //     console.table(results);
    //     loadMainMenu();
    //   }
    // );

    const [rows] = await db.execute(
      "SELECT department.id AS ID, department.name AS Department FROM department"
    );
    console.table(rows);
    loadMainMenu();
  }

  async function showAllRoles() {
    // db.query(
    //   "SELECT role.id AS ID, role.title AS Role, role.salary AS Salary, department.name AS Department FROM role JOIN department ON role.department_id = department.id ORDER BY role.id;",
    //   function (err, results) {
    //     console.table(results);
    //     // console.table();
    //     loadMainMenu();
    //   }
    // );
    const [rows] = await db.execute(
      "SELECT role.id AS ID, role.title AS Role, role.salary AS Salary, department.name AS Department FROM role JOIN department ON role.department_id = department.id ORDER BY role.id;"
    );
    console.table(rows);
    loadMainMenu();
  }

  async function showAllEmployees() {
    // db.query(
    //   "SELECT e.id AS ID, e.first_name AS FirstName, e.last_name as LastName, r.title AS Role, r.salary AS Salary, d.name AS Department, CONCAT(m.first_name, ' ',m.last_name) AS Manager FROM employee e LEFT JOIN role r ON e.role_id = r.id LEFT JOIN department d ON r.department_id = d.id LEFT JOIN employee m ON e.manager_id = m.id;",

    //   function (err, results) {
    //     console.table(results);
    //     loadMainMenu();
    //   }
    // );
    const [rows] = await db.execute(
      "SELECT e.id AS ID, e.first_name AS FirstName, e.last_name as LastName, r.title AS Role, r.salary AS Salary, d.name AS Department, CONCAT(m.first_name, ' ',m.last_name) AS Manager FROM employee e LEFT JOIN role r ON e.role_id = r.id LEFT JOIN department d ON r.department_id = d.id LEFT JOIN employee m ON e.manager_id = m.id;"
    );
    console.table(rows);
    loadMainMenu();
  }

  async function addDepartment() {
    const question = [
      {
        type: "input",
        name: "department_name",
        message: "Please enter department name you would like to add:",
      },
    ];
    inquirer.prompt(question).then(async (answer) => {
      const newDepartment = answer.department_name;
      await db.execute(
        `INSERT INTO department (name) VALUES ("${newDepartment}");`
      );
      console.table(`Department ${newDepartment} was successfully added!`);
      loadMainMenu();
    });
  }

  async function addRole() {
    // let departmentList;

    // db.query(
    //   "SELECT name FROM department",
    //   function (err, results) {
    //     // departmentList = results;
    //     const departmentList = results.map((a) => a.name);
    //     console.log(departmentList);
    //   }
    // );

    const [rows] = await db.execute("SELECT name FROM department");

    const departmentList = rows.map((a) => a.name);

    console.log(departmentList);

    //.map and Object/values
    //departmentList = ["Production", "Design",..]
    // let departmentArr = departmentList.Object.map(val => Object.values(departmentList));
    // console.log(departmentList);
    // console.log(departmentArr);

    loadMainMenu();
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
}

main();
