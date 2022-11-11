const axios = require('axios');
const cheerio = require('cheerio');

const siteTitle = 'AllSides';
const siteUrl = 'https://www.allsides.com';
const siteIcon =
  'https://www.allsides.com/sites/default/files/AllSides-Icon.png';

module.exports = async function () {
  let page = await axios.get(siteUrl);
  let $ = cheerio.load(page.data);

  const entries = await Promise.all(
    $('.headline-roundup')
      .toArray()
      .map(async (headline) => {
        const title = $(headline).find('a.main-link').text();
        const link = siteUrl + $(headline).find('a.main-link').attr('href');
        const imageSrc = $(headline)
          .find('.headline-roundup-image img')
          .attr('src');

        const image = `<img src="${imageSrc}">`;

        page = await axios.get(link);
        $ = cheerio.load(page.data);

        const story = $('.story-id-page-description').html();
        const coverage = $('.featured-coverage').html();

        // TODO: manually parse this
        const timestamp = $('.date-display-single').text();

        const content = `${image}<br />${story}<br />${coverage}`;

        return {
          title,
          image,
          link,
          content,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
      })
  );

  return { siteTitle, siteUrl, siteIcon, entries };
};
