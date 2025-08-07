const markdownIt = require("markdown-it");

// Wikilinks [[page]] и [[page|Алиас]], со спец‑кейсом для [[index]]
function wikilinkPlugin(md) {
  md.inline.ruler.before("emphasis", "wikilink", (state, silent) => {
    const start = state.pos;
    if (state.src.charCodeAt(start) !== 0x5B || state.src.charCodeAt(start + 1) !== 0x5B) return false;

    const end = state.src.indexOf("]]", start);
    if (end === -1) return false;

    const raw = state.src.slice(start + 2, end).trim();
    if (!raw) return false;

    // [[page|Алиас]] поддержка
    const [hrefRaw0, aliasRaw] = raw.split("|").map(s => s.trim());
    // Рекомендуется латиница в именах файлов/ссылок (чтобы URL и GitHub Pages не страдали)
    const hrefRaw = hrefRaw0;

    const alias = aliasRaw || hrefRaw;

    // Спец‑кейс: [[index]] -> "/"
    const href = hrefRaw.toLowerCase() === "index"
      ? "/"
      : `/${encodeURIComponent(hrefRaw)}/`;

    if (!silent) {
      const open = state.push("link_open", "a", 1);
      open.attrs = [["href", href]];

      const text = state.push("text", "", 0);
      text.content = alias;

      state.push("link_close", "a", -1);
    }

    state.pos = end + 2;
    return true;
  });
}

module.exports = function (eleventyConfig) {
  // Статика
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("style.css");

  // Глобальный layout
  eleventyConfig.addGlobalData("layout", "base.njk");

  // Коллекция постов (опционально, на будущее)
  eleventyConfig.addCollection("posts", (col) => col.getFilteredByGlob("*.md"));

  // Markdown + wikilinks
  const md = markdownIt({ html: true }).use(wikilinkPlugin);
  eleventyConfig.setLibrary("md", md);

  return {
    dir: { input: ".", includes: "_includes", output: "docs" },
    markdownTemplateEngine: "njk",
  };
};