module.exports = {
  siteMetadata: {
    title: `CodeTools`,
    description: `Frontend for CodeTools, written in Gatsby`,
    author: `@cyfinfaza`,
    apiLocation: `https://upstairs.cy2.me/api`,
    // apiLocation: `http://localhost:5000/api`,
    recaptchaSitekey: `6LdUiTMaAAAAAM1UpsF4jx1AnINaESqj03r5tv9_`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,

    `gatsby-plugin-gatsby-cloud`,
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
}
// var something = {
//   resolve: `gatsby-plugin-manifest`,
//   options: {
//     name: `gatsby-starter-default`,
//     short_name: `starter`,
//     start_url: `/`,
//     background_color: `#663399`,
//     theme_color: `#663399`,
//     display: `minimal-ui`,
//     icon: `src/images/gatsby-icon.png`, // This path is relative to the root of the site.
//   },
// },
