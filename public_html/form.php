<?php

echo 'Hello ' . htmlspecialchars($_POST["lName"]).' '.htmlspecialchars($_POST["fName"]).
        "\n\nYour email address is ". htmlspecialchars($_POST["email"]);

