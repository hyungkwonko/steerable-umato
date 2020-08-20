# steerable-umato
web demo of steerable UMATO

## how to publish on github
1. Add deploy command
- "predeploy": "npm run build",
- "deploy": "gh-pages -d build",
2. location setting (change rollup.config.js & index.html & tsconfig.json)
- rollup.config.js: build location
- index.html: repo name..
- tsconfig.json: baseUrl
3. deploy
- npm run deploy
