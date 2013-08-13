<?php
$temp = explode(".", $_FILES["file"]["name"]);
$extension = end($temp);
if (filter_var($_POST["inputEmail"], FILTER_VALIDATE_EMAIL)) {
  echo "This email address is considered valid.";
  mkdir("upload/".$_POST["inputEmail"]."/")
  if ($_FILES["file"]["size"] < 20000) {
    if ($_FILES["file"]["error"] > 0) {
      echo "Return Code: " . $_FILES["file"]["error"] . "<br>";
    }
    else {
      echo "Upload: " . $_FILES["file"]["name"] . "<br>";
      echo "Type: " . $_FILES["file"]["type"] . "<br>";
      echo "Size: " . ($_FILES["file"]["size"] / 1024) . " kB<br>";
      echo "Temp file: " . $_FILES["file"]["tmp_name"] . "<br>";

      if (file_exists("upload/".$_POST["inputEmail"]."/" . $_FILES["file"]["name"])) {
        echo $_POST["inputEmail"]."/".$_FILES["file"]["name"] . " already exists. ";
      }
      else {
        move_uploaded_file($_FILES["file"]["tmp_name"],
        "upload/" . $_POST["inputEmail"] . "/" . $_FILES["file"]["name"]);
        echo "Stored in: " . "upload/" . $_POST["inputEmail"] . "/" . $_FILES["file"]["name"];
      }
    }
  }
  else {
    echo "Invalid file";
  }
}