const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const app = express();
const PORT = 8080;
app.use(express.json());
app.use(cors());
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'coe',
})
db.connect((err)=>{
      if (err) {
    console.error('Error connecting to MariaDB', err);
  } else {
    console.log('Connected to MariaDB');
  }
})
// Creating the user_details table
db.query(`
  CREATE TABLE IF NOT EXISTS user_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL
  )
`, (err) => {
  if (err) {
    console.error('Error creating user_details table:', err);
  } else {
    console.log('user_details table created');
  }
});
// Creating the coe_content table with a foreign key referencing user_details.id
db.query(`
  CREATE TABLE IF NOT EXISTS coe_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    tag VARCHAR(255) NOT NULL,
    content TEXT,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES user_details(id)
  )
`, (err) => {
  if (err) {
    console.error('Error creating coe_content table:', err);
  } else {
    console.log('coe_content table created with foreign key');
  }
});
app.get("/api/test",(req, res)=>{
    res.json({
        message : "it a testing message"
    })
});
app.listen(PORT,()=>{
    console.log(`Server started on PORT ${PORT}`);
});
// api to insert user 
app.post('/api/createuser', (req, res) => {
  const { username, password, name } = req.body;

  if (!username || !password || !name) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const insertQuery = 'INSERT INTO user_details (username, password, name) VALUES (?, ?, ?)';

  db.query(insertQuery, [username, password, name], (err, result) => {
    if (err) {
      console.error('Error inserting user:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      console.log('User inserted successfully');
      res.status(201).json({ message: 'User inserted successfully', user_id: result.insertId });
    }
  });
});
app.post('/api/authenticate',(req, res)=>{ 
    const {username, password} = req.body;
    if(!username || !password){
      res.status(400).json({message : "Please enter username and password"});
    }else{
      
      const query =  "SELECT * FROM user_details WHERE username = ? AND password =?"
      db.query(query,[username, password],(error, result)=>{
          if(error){
              res.status(500).json({message : "Internal Server Error", auth : false});
          }else{
            if(result.length > 0){
                res.status(200).json({message : "Success", auth : true})
            }else{
              res.status(401).json({message : "Invalid Credentials"});
            }
          }
      })
    }
});