const escape = require('html-escaper').escape;

module.exports = (siteName, updatedAt, entries) => `
<h1>${siteName}</h1>
<p>Updated at: ${updatedAt.toLocaleDateString()} ${updatedAt.toLocaleTimeString()}</p>
<p>Available feeds: <a href="${siteName}/atom">Atom</a></p>
<p>Sample entries:</p>
<ul>${entries
  .map(
    ({ title, url }) => `<li><a href="${escape(url)}">${escape(title)}</a></li>`
  )
  .join('')}
</ul>
`;
