module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets/css");
  eleventyConfig.addPassthroughCopy("src/assets/js");
  
  eleventyConfig.addCollection("projects", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/projects/*.md");
  });
  
  eleventyConfig.addPassthroughCopy("src/sitemap.xml");
  
  // Ensure 404 is processed
  eleventyConfig.addPassthroughCopy("src/404.njk");
  
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
