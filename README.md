# Steerable UMATO
![result](./src/assets/p1.png)
![result](./src/assets/p2.png)

Steerable UMATO is an interactive web system for [UMATO](https://github.com/hyungkwonko/umato), which leverages two-phase optimization for dimensionality reduction. As there are many hyperparameters used in the algorithm, steerable UMATO provides an interactive way to explore such diversities for the best projection result. It consists of two main parts, global structure view (left half) and local structure view (right half). You can see the demo [here](https://hyungkwonko.github.io/steerable-umato/).

## Running the app locally
1. Download the source code
```bash
git clone https://github.com/hyungkwonko/steerable-umato.git
```

2. Install requirements
```bash
npm i
```

3. Run on a local machine
```bash
npm run dev
```

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