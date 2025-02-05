// app.js
const express = require("express");
const axios = require("axios");
const airports = require('./airport_list');
const app = express();
const port = 3000;

// Can be renamed to /nearby-airports
app.get("/", async (req, res) => {
  const location = req.query.location;
  const radius = req.query.radius || 500;
  console.log(radius)
  const currentAirport = airports.find(airport => airport.iata === location);
  if (currentAirport) {
   const tokenResponse = await axios.post(
     "https://test.api.amadeus.com/v1/security/oauth2/token",
     {
       grant_type: "client_credentials",
       client_id: "4JJmjuKzxQks9a13m5wfdtz0s4UTwnJs",
       client_secret: "iWi8OLYCpeAAOFUp",
     },
     { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
   );
   const response = await axios.get('https://test.api.amadeus.com/v1/reference-data/locations/airports', {
     params: { latitude: currentAirport.latitude, longitude: currentAirport.longitude, radius },
     headers: {"Authorization" : `Bearer ${tokenResponse.data.access_token}`}
   });
   console.log("hello")

   const nearbyAirports = response.data.data.map(details => ({name: details.name, iataCode: details.iataCode.toLowerCase()}));
   res.json(nearbyAirports);
  } else {
   res.status(500).send('Invalid request');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
