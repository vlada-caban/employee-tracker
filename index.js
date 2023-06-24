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

  //function to check if user entered anything
  const checkData = (data) => {
    if (data !== "") {
      return true;
    }
    return "Please enter requested data.";
  };

  //function to check if empty and decimal
  const checkIfDecimal = (data) => {
    const regex = /^-{0,1}\d*\.{0,1}\d+$/;
    if (regex.test(data) && data !== "") {
      return true;
    }
    return "Please enter salary in decimal format. Ex. 56897.45";
  };

  //function to display all departments from DB
  async function showAllDepartments() {
    try {
      const query =
        "SELECT department.id AS ID, department.name AS Department FROM department";
      const [rows] = await db.execute(query);
      console.table(rows);
      loadMainMenu();
    } catch (error) {
      console.error(error);
    }
  }

  //function to display all roles from DB
  async function showAllRoles() {
    try {
      const query =
        "SELECT role.id AS ID, role.title AS Role, role.salary AS Salary, department.name AS Department FROM role JOIN department ON role.department_id = department.id ORDER BY role.id;";

      const [rows] = await db.execute(query);
      console.table(rows);
      loadMainMenu();
    } catch (error) {
      console.error(error);
    }
  }

  //function to display all employees from DB
  async function showAllEmployees() {
    try {
      const query =
        "SELECT e.id AS ID, e.first_name AS FirstName, e.last_name as LastName, r.title AS Role, r.salary AS Salary, d.name AS Department, CONCAT(m.first_name, ' ',m.last_name) AS Manager FROM employee e LEFT JOIN role r ON e.role_id = r.id LEFT JOIN department d ON r.department_id = d.id LEFT JOIN employee m ON e.manager_id = m.id;";

      const [rows] = await db.execute(query);
      console.table(rows);
      loadMainMenu();
    } catch (error) {
      console.error(error);
    }
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

    inquirer
      .prompt(question)
      .then(async (answer) => {
        try {
          const newDepartment = answer.department_name;
          await db.execute(`INSERT INTO department (name) VALUES (?);`, [
            newDepartment,
          ]);
          console.table(`Department ${newDepartment} was successfully added!`);
          loadMainMenu();
        } catch (error) {
          console.error(error);
        }
      })
      .catch((error) => console.error(error));
  }

  //function to add a new role
  async function addRole() {
    //getting list of all departments to select for new role
    const [rows] = await db.execute("SELECT id, name FROM department");

    const departmentList = rows.map((department) => ({
      value: department.id,
      name: department.name,
    }));

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
        validate: checkIfDecimal,
      },
      {
        type: "list",
        name: "role_department_name",
        message: "Please select department for this role:",
        choices: departmentList,
      },
    ];

    inquirer
      .prompt(questions)
      .then(async (answers) => {
        try {
          const roleTitle = answers.role_title;
          const roleSalary = answers.role_salary;
          const departmentSelected = answers.role_department_name;

          await db.execute(
            `INSERT INTO role (title, salary, department_id) VALUES(?, ?, ?);`,
            [roleTitle, roleSalary, departmentSelected]
          );
          console.log(`Role ${roleTitle} was successfully Added!`);
          loadMainMenu();
        } catch (error) {
          console.error(error);
        }
      })
      .catch((error) => console.error(error));
  }

  //function to add a new employee
  async function addEmployee() {
    //getting list of all available roles
    const [roles] = await db.execute("SELECT id, title FROM role");
    const roleList = roles.map((role) => ({
      value: role.id,
      name: role.title,
    }));

    //getting list of all employees for a manager role
    const [managers] = await db.execute(
      "SELECT id, CONCAT(first_name,' ',last_name) AS full_name FROM employee"
    );
    const managerList = managers.map((manager) => ({
      value: manager.id,
      name: manager.full_name,
    }));

    managerList.push({
      value: 0,
      name: "None",
    });

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
        choices: managerList,
      },
    ];

    inquirer
      .prompt(questions)
      .then(async (answers) => {
        const firstName = answers.first_name_input;
        const lastName = answers.last_name_input;
        const roleSelected = answers.role_input;

        let manId;
        const managerSelected = answers.employee_manager;

        //checking if no manager, then assigning null to manager id
        if (managerSelected === 0) {
          manId = null;
        } else {
          manId = managerSelected;
        }

        //adding data into database, employee table
        await db.execute(
          `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES(?, ?, ?, ?);`,
          [firstName, lastName, roleSelected, manId]
        );

        console.log(
          `New employee ${firstName} ${lastName} was successfully added!`
        );

        loadMainMenu();
      })
      .catch((error) => console.error(error));
  }

  //function to update employee role
  async function updateEmployeeRole() {
    //getting list of all employees
    const [employees] = await db.execute(
      "SELECT id, CONCAT(first_name,' ',last_name) AS full_name FROM employee"
    );
    const employeeList = employees.map((name) => ({
      value: name.id,
      name: name.full_name,
    }));

    //getting list of all available roles
    const [roles] = await db.execute("SELECT id, title FROM role");
    const roleList = roles.map((role) => ({
      value: role.id,
      name: role.title,
    }));

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

    inquirer
      .prompt(questions)
      .then(async (answers) => {
        const fullName = answers.full_name_input;
        const newRoleSelected = answers.new_role_input;

        //updating role id in employee table for that employee
        await db.execute(`UPDATE employee SET role_id = ? WHERE id = ?;`, [
          newRoleSelected,
          fullName,
        ]);

        console.log(`Employee role was updated!`);

        loadMainMenu();
      })
      .catch((error) => console.error(error));
  }

  async function viewEmployeesByDepartment() {
    //getting list of all departments to select for new role
    const [rows] = await db.execute("SELECT id, name FROM department");
    const departmentList = rows.map((department) => ({
      value: department.id,
      name: department.name,
    }));

    const questions = [
      {
        type: "list",
        name: "department_name",
        message:
          "Please select department you would like to view employees for:",
        choices: departmentList,
      },
    ];

    inquirer
      .prompt(questions)
      .then(async (answers) => {
        const departmentSelected = answers.department_name;

        const [rows] = await db.execute(
          "SELECT CONCAT(e.first_name, ' ', e.last_name) as Employee, d.name AS Department FROM employee e LEFT JOIN role r ON e.role_id = r.id LEFT JOIN department d ON r.department_id = d.id WHERE d.id = ?;",
          [departmentSelected]
        );

        console.table(rows);

        console.log(`Showing employees from selected department!`);

        loadMainMenu();
      })
      .catch((error) => console.error(error));
  }

  function loadMainMenu() {
    inquirer
      .prompt(main_menu)
      .then((answer) => {
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
      })
      .catch((error) => console.error(error));
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
