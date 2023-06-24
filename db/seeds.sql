INSERT INTO department (name)
VALUES
    ("Production"),
    ("Design"),
    ("HR"), 
    ("Legal"), 
    ("Merchandising"), 
    ("Sales"), 
    ("IT"), 
    ("Executive");

INSERT INTO role (title, salary, department_id)
VALUES
    ("Designer", 80000, 2),
    ("Design Director", 100000, 2),
    ("Production Manager", 75000, 1),
    ("Director of Production", 125000, 1),
    ("CEO", 500000, 8),
    ("HR Coordinator", 85000.55, 3), 
    ("Paralegal", 80000, 4), 
    ("Merchandiser", 90000, 5), 
    ("VP of Merchandising", 150000, 5),
    ("Sales person", 80000, 6), 
    ("IT Support", 90000, 7);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
    ("Tom", "Johnson", 5, NULL),
    ("Kate", "Ryan", 2, 1),
    ("Sam", "Torres", 1, 2),
    ("Regina", "Rodriguez", 4, 1),
    ("Particia", "Levy", 3, 3),
    ("Natalie", "Maynez", 9, 1),
    ("Rebekah", "Katz", 8, 6);
