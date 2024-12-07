const fs = require('fs');

// Read the content of the file
const fileContent = fs.readFileSync('airport.csv', 'utf-8');

// Split the content by lines
const lines = fileContent.trim().split('\n');

// Convert each line into an object
const airports = lines.map(line => {
  let [country_code, region_name, iata, icao, airport, latitude, longitude] = line.split(',');
  country_code = country_code.replace(/"/g, '');
  region_name = region_name.replace(/"/g, '');
  iata = iata.replace(/"/g, '');
  icao = icao.replace(/"/g, '');
  airport = airport.replace(/"/g, '');
  latitude = latitude.replace(/"/g, '');
  longitude = longitude.replace(/"/g, '');
  return {
    country_code,
    region_name,
    iata,
    icao,
    airport,
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude)
  };
});

// Export the array of objects
module.exports = airports;