const axios = require('axios');
const cheerio = require('cheerio');

const months = require('../utils/months');

const name = 'AllSides';
const url = 'https://www.allsides.com';
const icon = 'https://www.allsides.com/sites/default/files/AllSides-Icon.png';
const expiresAfter = 15;

module.exports = async function () {
  let page = await axios.get(url);
  let $ = cheerio.load(page.data);

  const entries = await Promise.all(
    $('.headline-roundup')
      .toArray()
      .map(async (headline) => {
        const title = $(headline).find('a.main-link').text();
        const link = url + $(headline).find('a.main-link').attr('href');
        const imageSrc = $(headline)
          .find('.headline-roundup-image img')
          .attr('src');

        const image = `<img src="${imageSrc}">`;

        page = await axios.get(link);
        $ = cheerio.load(page.data);

        const story = $('.story-id-page-description').html();
        const coverage = $('.featured-coverage').html();

        const content = `${image}<br />${story}<br />${coverage}`;

        // convert pretty DOM date to JS parsable date
        const [rawMonth, rawDay, rawYear] = $('.date-display-single')
          .text()
          .split(' ');

        // get plan number val
        // then convert to number string with leading zero
        const month = months
          .get(rawMonth.toLowerCase())
          .toString()
          .padStart(2, '0');
        const day = parseInt(rawDay).toString().padStart(2, '0');

        const [_, timeString] = $('.date-display-single')
          .attr('content')
          .split('T');

        const fromContentDate = new Date(
          `${rawYear}-${month}-${day}T${timeString}`
        );

        const validContentDate =
          fromContentDate instanceof Date && !isNaN(fromContentDate.valueOf());

        const timestamp = validContentDate
          ? fromContentDate.toISOString()
          : new Date().toISOString();

        return {
          title,
          image,
          link,
          content,
          timestamp,
        };
      })
  );

  return { name, url, icon, expiresAfter, entries };
};
