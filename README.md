# Steerable UMATO

## todo:
1. local snapshot save
2. snapshot 클릭시 이펙트 넣기
3. 결과 출력 보드
4. 데이터 저장
5. d3 그림
6. run이랑 연동 (3 & 5)

## how to publish on github
1. package.json에 주소 추가
- "homepage": "https://{GITHUB-ID}/github.io/{REPO-NAME}"
2. deploy 명령어 추가
- "predeploy": "npm run build",
- "deploy": "gh-pages -d build",
3. 배포
- npm run deploy