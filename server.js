const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/latest', async (req, res) => {
  try {
    // URL du site FDJ ou source publique (à adapter)
    const url = 'https://www.fdj.fr/jeux-de-tirage/euromillions';
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Exemple de scraping (à ajuster selon la structure réelle du site)
    const draws = [];
    $('.draw-result').each((i, el) => {
      const date = $(el).find('.draw-date').text().trim();
      const numbers = [];
      $(el).find('.draw-number').each((j, numEl) => {
        numbers.push($(numEl).text().trim());
      });
      draws.push({ date, numbers });
    });

    res.json(draws);
  } catch (error) {
    res.status(500).json({ error: 'Impossible de récupérer les tirages.' });
  }
});

app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));