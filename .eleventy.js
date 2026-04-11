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

function isPublicEntry(item) {
  if (!item || !item.inputPath || !item.url) return false;
  if (!item.inputPath.endsWith(".md")) return false;
  if (item.fileSlug === "index") return false;
  if (item.data.eleventyExcludeFromCollections) return false;
  if (!item.data.section) return false;

  return !item.inputPath.includes("/_templates/") && !item.inputPath.startsWith("./_templates/");
}

function getExplicitDate(item) {
  if (!item || !item.data || !item.data.date) return null;

  const date = new Date(item.data.date);
  return Number.isNaN(date.getTime()) ? null : date;
}

function sortEntries(a, b) {
  const dateA = getExplicitDate(a);
  const dateB = getExplicitDate(b);

  if (dateA && dateB && dateA.getTime() !== dateB.getTime()) {
    return dateB - dateA;
  }

  if (dateA && !dateB) return -1;
  if (!dateA && dateB) return 1;

  const titleA = a.data.title || a.fileSlug;
  const titleB = b.data.title || b.fileSlug;
  return titleA.localeCompare(titleB, "ru");
}

module.exports = function (eleventyConfig) {
  // 1) Базовый префикс берём из ENV
  const BASE_PREFIX = normalizePrefix(process.env.BASE_PREFIX);
  const BASE = BASE_PREFIX ? `${BASE_PREFIX}/` : "/";

  // 2) Статика
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("files");
  eleventyConfig.addPassthroughCopy("fonts");
  eleventyConfig.addPassthroughCopy("style.css");
  eleventyConfig.addPassthroughCopy("CNAME");

  // 3) Глобальные данные
  eleventyConfig.addGlobalData("layout", "base.njk");
  eleventyConfig.addGlobalData("base", BASE);

  eleventyConfig.addFilter("htmlDateString", (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toISOString().slice(0, 10);
  });

  eleventyConfig.addFilter("readableDate", (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  });

  // 4) Коллекции (на будущее)
  eleventyConfig.addCollection("entries", (collectionApi) =>
    collectionApi.getAll().filter(isPublicEntry).sort(sortEntries)
  );
  eleventyConfig.addCollection("resources", (collectionApi) =>
    collectionApi
      .getAll()
      .filter((item) => isPublicEntry(item) && item.data.section === "resource")
      .sort(sortEntries)
  );
  eleventyConfig.addCollection("blog", (collectionApi) =>
    collectionApi
      .getAll()
      .filter((item) => isPublicEntry(item) && item.data.section === "blog")
      .sort(sortEntries)
  );
  eleventyConfig.addCollection("products", (collectionApi) =>
    collectionApi
      .getAll()
      .filter((item) => isPublicEntry(item) && item.data.section === "product")
      .sort(sortEntries)
  );
  eleventyConfig.addCollection("media", (collectionApi) =>
    collectionApi
      .getAll()
      .filter((item) => isPublicEntry(item) && item.data.section === "media")
      .sort(sortEntries)
  );
  eleventyConfig.addCollection("projects", (collectionApi) =>
    collectionApi
      .getAll()
      .filter((item) => isPublicEntry(item) && item.data.section === "project")
      .sort(sortEntries)
  );

  // 5) Markdown + wikilinks
  const md = markdownIt({ html: true }).use(makeWikilinkPlugin(BASE_PREFIX));
  eleventyConfig.setLibrary("md", md);

  return {
    dir: { input: ".", includes: "_includes", output: "docs" },
    markdownTemplateEngine: "njk",
  };
};
