const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

const port = 3000; // You can change the port number if needed
const name="Kunal";
const surname="Kabra";
app.use(express.json());

app.get('/flight-search', (req, res) => {
    const {
        src,
        des,
        ddate,
        isr,
        rdate,
        cls,
        adult,
        child,
        infant,
        wanted_price
    } = req.query;

    const url = `https://www.bing.com/travel/flight-search?q=flights+from+${src}-${des}&src=${src}&des=${des}&ddate=${ddate}&isr=${isr}&rdate=${rdate}&cls=0&adult=${adult}&child=${child}&infant=${infant}&form=FLAFLI&entrypoint=FBSCOP`;

    // Send the constructed URL and wanted price back as response
    res.json({ name, surname });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
