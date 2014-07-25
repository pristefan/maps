<?php

// Create connection
$con = mysqli_connect("localhost", "root", "acer", "db_login");

// Check connection
if (mysqli_connect_errno()) {
    echo "Failed to connect to MySQL: " . mysqli_connect_error();
}
$sql = "SELECT *
FROM   login
ORDER BY  `index` DESC ,  `username` DESC 
LIMIT 0 , 30";
$result = mysqli_query($con, $sql);
$row = mysqli_fetch_array($result);
if (!empty($_POST['lName']) &&
        !empty($_POST["fName"]) &&
        !empty($_POST['email'])) {
    echo 'Hello ' . htmlspecialchars($_POST["fName"]) . ' ' . htmlspecialchars($_POST["lName"]) .
    "\n\nYour email address is " . htmlspecialchars($_POST["email"]);
    $sql = "INSERT INTO `db_login`.`login` (`index`, `username`, `lName`, `fName`, `pass`, `email`)    VALUES ('" . ++$row['index'] . "', '" . htmlspecialchars($_POST["user"]) . "','" . htmlspecialchars($_POST["lName"]) . "','" . htmlspecialchars($_POST["fName"]) . "','" . htmlspecialchars($_POST["pass"]) . "','" . htmlspecialchars($_POST["email"]) . "');";
    mysqli_query($con, $sql);
}
$sql = "SELECT * 
FROM  `login` 
WHERE  `username` LIKE  '" . htmlspecialchars($_POST["user"]) . "'
LIMIT 0 , 30";
$result = mysqli_query($con, $sql);
$row = mysqli_fetch_array($result);
if (!empty($_POST['user']) && $row['pass'] == htmlspecialchars($_POST["pass"])) {
    echo 'Hello ' . $row['lName'] . ' ' . $row['fName'];
} elseif(!empty($_POST['user'])) {
    echo 'Wrong Password';
}
