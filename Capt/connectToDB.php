<?php


function connectToDB(){
  // **************'
  // CREATE PDO-Object TO CONNECT WITH DB
  // This line if the DB is on MAUs server
  //  return new PDO('mysql:host=localhost;dbname=ah5479','ah5479','Databas1'); 
  
  // This line if the DB is locally on MAMP
  return new PDO('mysql:host=localhost;dbname=capt','root','root'); 
}

?>