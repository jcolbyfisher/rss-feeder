function buildAtomBase({
  siteTitle,
  hostWithSiteIdentifier,
  siteIcon,
  updatedAt,
  siteUrl,
  entries,
}) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <title type="text">${siteTitle}</title>
  <id>${hostWithSiteIdentifier}</id>
  <icon>${siteIcon}</icon>
  <logo>${siteIcon}</logo>
  <updated>${updatedAt}</updated>
  <author>
    <name>rss-feeder</name>
  </author>
  <link rel="alternate" type="text/html" href="${siteUrl}"/>
  <link rel="self" type="application/atom+xml" href="${hostWithSiteIdentifier}"/>
  ${entries.map(buildAtomEntry)}
</feed>`;
}

function buildAtomEntry({ title, image, link, content, createdAt, updatedAt }) {
  return `<entry>
  <title type="html">${title}</title>
  <published>${createdAt}</published>
  <updated>${updatedAt}</updated>
  <id>${link}</id>
  <link rel="alternate" type="text/html" href="${link}"/>
  <content type="html"><![CDATA[${content}]]></content>
</entry>`;
}

module.exports = function ({ siteTitle, siteUrl, siteIcon, entries }) {
  return buildAtomBase({ siteTitle, siteUrl, siteIcon, entries });
};
