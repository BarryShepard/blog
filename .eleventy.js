const markdownIt = require("markdown-it");

// Нормализуем BASE_PREFIX: "", "/blog" или "/blog/"
function normalizePrefix(p) {
  if (!p) return "";                 // значит корень
  if (!p.startsWith("/")) p = "/" + p;
  if (p !== "/" && p.endsWith("/")) p = p.slice(0, -1);
  return p === "/" ? "" : p;         // "/" трактуем как корень
}

function makeWikilinkPlugin(base) {
  return function wikilinkPlugin(md) {
    md.inline.ruler.before("emphasis", "wikilink", (state, silent) => {
      const start = state.pos;
      if (state.src.charCodeAt(start) !== 0x5B || state.src.charCodeAt(start + 1) !== 0x5B) return false;

      const end = state.src.indexOf("]]", start);
      if (end === -1) return false;

      const raw = state.src.slice(start + 2, end).trim();
      if (!raw) return false;

      // [[page|Алиас]]
      const [hrefRaw0, aliasRaw] = raw.split("|").map(s => s.trim());
      const hrefRaw = hrefRaw0;               // рекомендация: латиница в именах файлов
      const alias = aliasRaw || hrefRaw;

      // index -> на корень сайта с учётом префикса
      const isIndex = hrefRaw.toLowerCase() === "index";
      const slug = encodeURIComponent(hrefRaw);
      const href = isIndex
        ? (base || "/")
        : `${base}/${slug}/`.replace(/\/+/g, "/"); // страховка от двойных слэшей

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
  };
}

module.exports = function (eleventyConfig) {
  // 1) Базовый префикс берём из ENV
  const BASE_PREFIX = normalizePrefix(process.env.BASE_PREFIX);

  // 2) Статика
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("files");
  eleventyConfig.addPassthroughCopy("style.css");

  // 3) Глобальные данные
  eleventyConfig.addGlobalData("layout", "base.njk");
  eleventyConfig.addGlobalData("base", BASE_PREFIX || "/");

  // 4) Коллекции (на будущее)
  eleventyConfig.addCollection("posts", col => col.getFilteredByGlob("*.md"));

  // 5) Markdown + wikilinks
  const md = markdownIt({ html: true }).use(makeWikilinkPlugin(BASE_PREFIX));
  eleventyConfig.setLibrary("md", md);

  return {
    dir: { input: ".", includes: "_includes", output: "docs" },
    markdownTemplateEngine: "njk",
  };
};