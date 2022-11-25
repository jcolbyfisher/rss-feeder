const escape = require('html-escaper').escape;

module.exports = (
  feedId,
  siteTitle,
  siteUrl,
  siteIcon,
  updatedAt,
  entries
) => `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <title type="text">${siteTitle}</title>
  <id>${feedId}</id>
  <icon>${siteIcon}</icon>
  <logo>${siteIcon}</logo>
  <updated>${updatedAt.toISOString()}</updated>
  <author>
    <name>rss-feeder</name>
  </author>
  <link rel="alternate" type="text/html" href="${siteUrl}"/>
  <link rel="self" type="application/atom+xml" href="${feedId}"/>
  ${entries
    .map(
      ({ title, url, content, timestamp }) => `
  <entry>
    <title type="html">${escape(title)}</title>
    <published>${escape(new Date(timestamp).toISOString())}</published>
    <updated>${escape(new Date(timestamp).toISOString())}</updated>
    <id>${escape(url)}</id>
    <link rel="alternate" type="text/html" href="${escape(url)}"/>
    <content type="html">${escape(content)}</content>
  </entry>
  `
    )
    .join('')}
</feed>`;
