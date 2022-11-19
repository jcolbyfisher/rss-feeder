function buildAtomBase({
  siteTitle,
  siteIcon,
  lastFetchedAt,
  siteUrl,
  entries,
}) {
  const hostWithSiteIdentifier = `${siteTitle}: ${siteUrl}`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <title type="text">${siteTitle}</title>
  <id>${hostWithSiteIdentifier}</id>
  <icon>${siteIcon}</icon>
  <logo>${siteIcon}</logo>
  <updated>${lastFetchedAt}</updated>
  <author>
    <name>rss-feeder</name>
  </author>
  <link rel="alternate" type="text/html" href="${siteUrl}"/>
  <link rel="self" type="application/atom+xml" href="${hostWithSiteIdentifier}"/>
  ${entries.map(buildAtomEntry)}
</feed>`;
}

function buildAtomEntry({ title, url, content, timestamp }) {
  return `<entry>
  <title type="html">${title}</title>
  <published>${timestamp}</published>
  <updated>${timestamp}</updated>
  <id>${url}</id>
  <link rel="alternate" type="text/html" href="${url}"/>
  <content type="html"><![CDATA[${content}]]></content>
</entry>`;
}

module.exports = function (
  siteTitle,
  siteUrl,
  siteIcon,
  lastFetchedAt,
  entries
) {
  return buildAtomBase({
    siteTitle,
    siteUrl,
    siteIcon,
    lastFetchedAt,
    entries,
  });
};
