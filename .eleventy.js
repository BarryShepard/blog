module.exports = function (eleventyConfig) {
  eleventyConfig.addGlobalData("layout", "base.njk");

  return {
    pathPrefix: "/blog/",
    dir: {
      input: ".",
      includes: "_includes",
      output: "docs",
    },
    markdownTemplateEngine: "njk",
  };
};