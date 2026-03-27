/** @type {import('lint-staged').Configuration} */
const config = {
  '*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],
  '*.{css,scss}': ['prettier --write'],
  '*.{json,md,mdx}': ['prettier --write'],
}

module.exports = config
