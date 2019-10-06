<?php

// SMALL CHECK THAT ALL IS OK
if (!isset($_GET['action'])) {
  exit('Error');
}

// Include the connect function
require_once ('connectToDB.php');

// What are we doing?
$action = $_GET['action'];

if ($action == 'getRandomElement') {
  $sql = 'SELECT File FROM Image ORDER BY RAND() LIMIT 1';

  // Get PDO-object connected to DB
  $pdo = connectToDB();
  
  // PREPARE SQL-QUERY
  $result = $pdo->prepare($sql);
  
  // EXECUTE SQL-QUERY
  $result->execute();
  
  // FETCH DATA AS ARRAY
  $answer = $result->fetchAll(\PDO::FETCH_ASSOC);
  
  // GET THE FIRST ELEMENT OF THE ARRAY
  // It only has one element, because of LIMIT 1
  // but we still need to get it out of the array.
  // This can also be done on the js-side.
  $answer = $answer[0];
  
  // ENCODE AS JSON
  $answer = json_encode($answer);
  
  // SEND TO BROWSER (CLIENT)
  echo $answer;

  
}
else if ($action == 'write') {
  $sqlQuery = 'INSERT INTO Caption (Text, File, Login)
               VALUES (?, ?, ?)';

  // Get PDO-object connected to DB
  $pdo = connectToDB();
  
  // PREPARE SQL-QUERY & BIND PARAMS
  $sql = $pdo->prepare($sqlQuery);
  $sql->bindParam(1, $_GET['caption']);
  $sql->bindParam(2, $_GET['file']);
  $temp = 'erik';
  $sql->bindParam(3, $temp);
    
  // EXECUTE SQL-QUERY & TELL BROWSER IF OK
  if ($sql->execute()) {
    echo '1';
  } else {
    echo '0';
  }  
}

?>