const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: '172.16.4.28',  // Change this if you're using a remote database
    user: 'bfmprd',  // Replace with your MariaDB username
    password: 'ad7ert74',  // Replace with your MariaDB password
    database: 'ownbfmprd', 
    port: 3465, // Your database name
    connectionLimit: 5
  });

  async function getAiFareData() {
    let conn;
    try {
      // Get a connection from the pool
      conn = await pool.getConnection();
  
      // Execute a SELECT query to fetch data from ai_fare table
      const rows = await conn.query("SELECT * FROM ai_fare");
  
      // Display the results
      console.log("ai_fare Table Data:");
      console.log(rows);
    } catch (err) {
      // Handle any errors
      console.error("Error while fetching data from ai_fare:", err);
    } finally {
      // Release the connection back to the pool
      if (conn) conn.release();
    }
  }
  getAiFareData();
