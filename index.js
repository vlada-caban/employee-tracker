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
    const query =
      "SELECT department.id AS ID, department.name AS Department FROM department";

    const [rows] = await db.execute(query);
    console.table(rows);
    loadMainMenu();
  }

  async function showAllRoles() {
    const query =
      "SELECT role.id AS ID, role.title AS Role, role.salary AS Salary, department.name AS Department FROM role JOIN department ON role.department_id = department.id ORDER BY role.id;";

    const [rows] = await db.execute(query);
    console.table(rows);
    loadMainMenu();
  }

  async function showAllEmployees() {
    const query =
      "SELECT e.id AS ID, e.first_name AS FirstName, e.last_name as LastName, r.title AS Role, r.salary AS Salary, d.name AS Department, CONCAT(m.first_name, ' ',m.last_name) AS Manager FROM employee e LEFT JOIN role r ON e.role_id = r.id LEFT JOIN department d ON r.department_id = d.id LEFT JOIN employee m ON e.manager_id = m.id;";

    const [rows] = await db.execute(query);
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
    const [rows] = await db.execute("SELECT name FROM department");
    const departmentList = rows.map((a) => a.name);

    const questions = [
      {
        type: "input",
        name: "role_title",
        message: "Please enter role title:",
      },
      {
        type: "input",
        name: "role_salary",
        message: "Please enter salary for this role:",
      },

      {
        type: "list",
        name: "role_department_name",
        message: "What would you like to do?",
        choices: departmentList,
      },
    ];

    inquirer.prompt(questions).then(async (answers) => {
      const roleTitle = answers.role_title;
      const roleSalary = answers.role_salary;
      const departmentSelected = answers.role_department_name;
      console.log(departmentSelected);

      const [deptID] = await db.execute(
        `SELECT id FROM department WHERE name = "${departmentSelected}";`
      );

      const id = deptID.map(a=>a.id)[0];
      console.log(id);
      
      await db.execute(
        `INSERT INTO role (title, salary, department_id) VALUES("${roleTitle}", ${roleSalary}, ${id});`
      );

      console.log(`Role ${roleTitle} was successfully Added!`);

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
