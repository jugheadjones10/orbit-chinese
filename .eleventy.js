const { EleventyServerlessBundlerPlugin } = require("@11ty/eleventy");

module.exports = function(eleventyConfig) {
   // eleventyConfig.addPlugin(EleventyServerlessBundlerPlugin, {
   //  name: "onrequest", // The serverless function name from your permalink object
   //  functionsDir: "./netlify/functions/",
  // });

  // Copy `img/` to `_site/img`
  eleventyConfig.addPassthroughCopy("big.css");
  eleventyConfig.addPassthroughCopy("big.js");
  eleventyConfig.addPassthroughCopy("load-test.js");
  eleventyConfig.addPassthroughCopy("supermemo.js");
  eleventyConfig.addPassthroughCopy("shared/fisher-yates-shuffle");
};
