<?php

if (!empty($_POST['lName']) &&
        !empty($_POST["fName"]) &&
        !empty($_POST['email'])) {
    echo 'Hello ' . htmlspecialchars($_POST["fName"]) . ' ' . htmlspecialchars($_POST["lName"]) .
    "\n\nYour email address is " . htmlspecialchars($_POST["email"]);
}
if (!empty($_POST['user'])) {
    echo 'Hello ' . htmlspecialchars($_POST["user"]);
}
