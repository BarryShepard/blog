const markdownIt = require("markdown-it");

// Расширенный wikilink-плагин с поддержкой [[page|Алиас]]
function wikilinkPlugin(md) {
  md.inline.ruler.before("emphasis", "wikilink", (state, silent) => {
    const start = state.pos;

    if (
      state.src.charCodeAt(start) !== 0x5B || // [
      state.src.charCodeAt(start + 1) !== 0x5B // [
    ) return false;

    const end = state.src.indexOf("]]", start);
    if (end === -1) return false;

    const raw = state.src.slice(start + 2, end).trim();
    if (!raw) return false;

    const [hrefRaw, aliasRaw] = raw.split("|").map(s => s.trim());
    const href = encodeURIComponent(hrefRaw); // можешь заменить на hrefRaw если не хочешь URL-кодировку
    const alias = aliasRaw || hrefRaw;

    if (!silent) {
      const token = state.push("link_open", "a", 1);
      token.attrs = [["href", `/${href}/`]];

      const text = state.push("text", "", 0);
      text.content = alias;

      state.push("link_close", "a", -1);
    }

    state.pos = end + 2;
    return true;
  });
}

module.exports = function (eleventyConfig) {
  // Статические файлы
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("style.css");

  // Глобальный layout для всех страниц
  eleventyConfig.addGlobalData("layout", "base.njk");

  // Коллекция постов (если будешь использовать)
  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi.getFilteredByGlob("*.md");
  });

  // Markdown с поддержкой Obsidian-style ссылок
  const md = markdownIt({ html: true }).use(wikilinkPlugin);
  eleventyConfig.setLibrary("md", md);

  return {
    dir: {
      input: ".",
      includes: "_includes",
      output: "docs", // для GitHub Pages
    },
    markdownTemplateEngine: "njk",
  };
};