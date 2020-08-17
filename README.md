# Steerable UMATO

## todo:
0. 줄이면 막대 바 깨지는거 수정
1. ~~local snapshot save~~
2. ~~snapshot 클릭시 이펙트 넣기~~
3. 결과 출력 보드 만들기 (d3 line chart + table)
4. 데이터 저장
5. d3 그림
6. run이랑 연동 (3 & 5)

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