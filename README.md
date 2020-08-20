# Steerable UMATO

## todo:
0. ~~global HPs setting 후 local optimize되게끔~~
1. ~~local snapshot save~~
2. ~~snapshot 클릭시 이펙트 넣기~~
3. ~~결과 출력 보드 만들기 (d3 line chart + table)~~
4. ~~데이터 저장~~
5. ~~d3 라인차트~~
- ~~mouseover 연동하기~~
- ~~text도 같이 연동하기~~
- ~~mouseout 처리하기~~
- ~~시간별로 출력하기~~
- ~~axis label & legend 넣기~~
6. ~~d3 Scatterplots~~
- ~~시간별로 출력하기~~
7. run이랑 연동 (3 & 5,6)

## how to publish on github
1. deploy 명령어 추가
- "predeploy": "npm run build",
- "deploy": "gh-pages -d build",
2. rollup.config.js & index.html & tsconfig.json 에서 경로 수정
- rollup.config.js: build 위치
- index.html: repo 이름 등..
- tsconfig.json: baseUrl
3. 배포
- npm run deploy