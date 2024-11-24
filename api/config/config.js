require('dotenv').config();

module.exports = {
    GITHUB_API_URL: process.env.GITHUB_API_URL,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    ENTERPRISE: process.env.ENTERPRISE,
    TEAM_SLUG: process.env.TEAM_SLUG,
    ORG: process.env.ORG,
    API_VERSION: process.env.API_VERSION || '2022-11-28'
};
