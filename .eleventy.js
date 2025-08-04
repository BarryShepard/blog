module.exports = function (eleventyConfig) {
  eleventyConfig.addGlobalData("layout", "base.njk");

  return {
    dir: {
      input: ".",
      includes: "_includes",
      output: "_site",
    },
    markdownTemplateEngine: "njk", // важно для layout в .md
  };
};