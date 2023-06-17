const inquirer = require("inquirer");
// const express = require("express");
const mysql = require("mysql2");

// const PORT = process.env.PORT || 3001;
// const app = express();

// Express middleware
// app.use(express.urlencoded({ extended: false }));
// app.use(express.json());

// Connect to database
const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "rootpass",
    database: "employees_db",
  },
  console.log(`Connected to the employees_db database.`)
);

// db.query("SELECT * FROM employee", function (err, results) {
//   console.log(results);
// });

const main_menu = [
    "View all departments", 
    "View all roles", 
    "view all employees", 
    "Add a department", 
    "Add a role", 
    "Add an employee", 
    "Update an employee role"
];