module.exports = function (app, fs) {
  let data = [[],[],[],[],[],[],[],[],[],[],[]] //최대 10라운드 가능
  let round = -1

  app.get("/", (req, res) => {
    // res.render("index.html");
    res.render("index", {
      title: "콩의 딜레마 - index"
    });
  });

  app.get("/game/:team/:user", (req, res) => {
    let user
    if(data[round]){
      user = data[round].find(item => item.user === req.params.user)
      if(!user) {
        data[round].push({
          user: req.params.user,
          team: req.params.team,
          beans: 10,
          summit: 0
        })
        user = data[round].find(item => item.user === req.params.user)
      } 
    } else {
      res.json('아직 라운드가 시작하지 않았어요. 진행자가 시작할 떄까지 뒤로 가서 기다려주세요')
    }
    res.render("game", {
      title: "콩의 딜레마 - game",
      team: req.params.team,
      user: req.params.user,
      round: round + 1,
      count: user.beans
    });

  });

  app.get("/game/wait", (req, res) => {
    res.render("wait", {
      title: "콩의 딜레마 - wait"
    });
  });

  app.get("/back/result", (req, res) => {
    const teamA = data[round].filter(item => item.team === 'A').map(item => item.summit).reduce((acc, cur) => acc + cur, 0)
    const teamB = data[round].filter(item => item.team === 'B').map(item => item.summit).reduce((acc, cur) => acc + cur, 0)
    res.render("back/result", {
      title: "콩의 딜레마 - 결과",
      teamA: teamA,
      teamB: teamB,
      round: round + 1
    });
  });

  app.get("/back", (req, res) => {
    res.render("back/index", {
      title: "콩의 딜레마 - 진행자페이지"
    });
  });

  app.get("/back/start", (req, res) => {
    res.render("back/start.html");
  });

  app.post("/api/start", (req, res) => {
    round++;
    res.redirect('/back/time');
  });

  app.post("/api/reset", (req, res) => {
    round = -1;
    data = [[],[],[],[],[],[],[],[],[],[],[]];
    res.json('라운드가 리셋되었습니다')
  });

  app.get("/back/time", (req, res) => {
    res.render("back/time", {
      title: "콩의 딜레마 - 남은시간",
      round: round + 1
    });
  });

  app.get("/back/summary", (req, res) => {
    res.json(data[round]);
  });

  app.post("/write", (req, res) => {
    // res.send(req.body);
    let result = {};
    const team = req.body.team;
    const username = req.body.user;
    const beansCount = req.body.beans;

    // validate
    if (!team || !username) {
      result["success"] = 0;
      result["error"] = "invalid request";

      res.JSON(result);
      return;
    }

    if(round > -1){
      const userData = data[round].find(item => item.user === username);
      let remainBeans = userData.beans;
      if (remainBeans - beansCount > 0) {
        userData.beans = Number(remainBeans - beansCount);
        userData.summit = Number(beansCount);
      } else {
        res.json('남은 콩이 모자라요. 뒤로 다시 돌아가주세요');
      }
      res.redirect('/game/' + team + '/' + username);
    } else {
      res.json('아직 라운드가 시작하지 않았어요');
    }
    
  });
};