const http = require('http'); // Use the http module

// URL you want to ping
const nearbyUrl = 'http://localhost:3000/?location=BOM&radius=300';
let data = ''; 
let nearbyAirports = {};

// Function to make a GET request
http.get(nearbyUrl, (res) => {  // Use http.get instead of https.get

  // Collect response data
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      // Parse the JSON response
      const airports = JSON.parse(data);

      // Store the airports starting from index 1 and the next 2 airports (i.e., indexes 1, 2, and 3)
      nearbyAirports = {};

      for (let i = 1; i < 4 && i < airports.length; i++) {  // Start at 1 and get 2 more after that
        const airport = airports[i];
        if (airport.iataCode) {
          nearbyAirports[airport.iataCode] = airport.name;  // Store IATA code as key, name as value
        }
      }

      // Now print all IATA codes from nearbyAirports object
      for (let iataCode in nearbyAirports) {
        console.log(iataCode);  // Print IATA code one by one
      }

    } catch (error) {
      console.error('Error parsing response:', error);
    }
  });
}).on('error', (error) => {
  console.error('Error making request:', error);
});

