const escape = require('html-escaper').escape;

module.exports = (siteName, updatedAt, entries) => `
<h1>${siteName}</h1>
<p>Updated at: ${updatedAt.toLocaleDateString()} ${updatedAt.toLocaleTimeString()}</p>
<ul>${entries
  .map(
    ({ title, url }) => `<li><a href="${escape(url)}">${escape(title)}</a></li>`
  )
  .join('')}
</ul>`;
