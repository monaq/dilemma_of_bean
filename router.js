module.exports = function (app, fs) {
  let rounds = []
  let roundIndex = -1
  let users = {}

  function getRound() {
    let round = rounds[roundIndex]
    if (!round) {
      rounds[roundIndex] = round = []
    }

    return round
  }

  function User(team, username, beans) {
    this.username = username
    this.team = team
    this.beans = beans
    this.submit = (submitBeans) => {
      if (this.beans - submitBeans < 0) {
        return null
      }

      this.beans -= submitBeans

      return {
        username: this.username,
        team: this.team,
        submitBeans
      }
    }
  }

  function getUser(team, username) {
    if (!users[username]) {
      users[username] = new User(team, username, 10)
    }
    return users[username]
  }

  app.get("/", (req, res) => {
    
    res.render("index", {
      title: "콩의 딜레마 - index",
    });
  });

  app.post("/back/join", (req, res) => {
    const team = req.body.team;
    const username = req.body.username;

    // join
    res.redirect(`/game/${team}/${username}`)
  });

  app.get("/back/reset", (req, res) => {
    roundIndex = -1;
    rounds = []
    users = {}
    // join
    res.redirect(`/back`)
  });

  app.get("/game/:team/:user", (req, res) => {
    const { user, team } = req.params
    if (roundIndex === -1) {
      res.json('아직 라운드가 시작하지 않았어요. 진행자가 시작할 떄까지 기다려주세요')
    }

    const round = getRound()
    const _user = getUser(team, user)

    if (round.filter(r => r.username === _user.username).length > 0) {
      res.json('이번 라운드는 제출했어요 기다려주세요')
    }

    res.render("game", {
      title: "콩의 딜레마 - game",
      team: _user.team,
      user: _user.username,
      round: roundIndex,
      count: _user.beans
    });
  });

  app.get("/back/result", (req, res) => {
    if (roundIndex < 0) {
      res.redirect('/back');
    }
    const round = getRound()
    const teamA = round
      .filter(item => item.team === 'A')
      .map(item => item.submitBeans)
      .reduce((acc, cur) => acc + cur, 0)

    const teamB = round
      .filter(item => item.team === 'B')
      .map(item => item.submitBeans)
      .reduce((acc, cur) => acc + cur, 0)

    let winTeam

    const whoswin = teamA - teamB 
    if (whoswin === 0) {
      winTeam = null
      desc = '비김'
    } else if (whoswin < 0) {
      winTeam = 'B'
      desc = `A팀 ${teamA} 개로 짐`
    } else {
      winTeam = 'A'
      desc = `B팀 ${teamB} 개로 짐`
    }

    

    res.render("back/result", {
      title: "콩의 딜레마 - 결과",
      winTeam: winTeam,
      desc: desc,
      round: roundIndex,
    });
  });

  // 메인
  app.get("/back", (req, res) => {
    const ateam = []
    const bteam = []
    for(let u in users) {
      if (users[u].team === 'A') {
        ateam.push(users[u].username)
      } else {
        bteam.push(users[u].username)
      }
    }
    res.render("back/index", {
      title: "콩의 딜레마 - 진행자페이지",
      users: `A: ${ateam.join(', ')} / B: ${bteam.join(', ')}`
    });
  });

  // 게임 시작 / 초기화 
  app.get("/back/start", (req, res) => {
    roundIndex = 1;
    rounds = []
    users = {}

    res.redirect('/back/time');
  });

  // 라운드 진행중
  app.get("/back/time", (req, res) => {
    if (roundIndex < 0) {
      res.redirect('/back');
    }
    res.render("back/time", {
      title: "콩의 딜레마 - 남은시간",
      round: roundIndex
    });
  });

  // 라운드 서머리
  app.get("/back/summary", (req, res) => {
    if (roundIndex < 0) {
      res.redirect('/back');
    }
    res.json(getRound());
  });

  // 다음 라운드 
  app.get('/back/next', (req, res) => {
    if (roundIndex < 0) {
      res.redirect('/back');
    }
    roundIndex++
    res.redirect('/back/time');
  });

  // 게임 종료 
  app.get('/back/end', (req, res) => {
    res.json(rounds);
  });

  // 콩 제출
  app.post("/write", (req, res) => {
    let result = {};
    const team = req.body.team;
    const username = req.body.user;
    const beansCount = Number(req.body.beans);

    // validate
    if (!team || !username) {
      result["success"] = 0;
      result["error"] = "invalid request";

      res.JSON(result);
      return;
    }

    let round = getRound()
    const user = getUser(team, username)

    result = user.submit(beansCount)
    if (result) {
      round.push(result)
      res.redirect('/game/' + team + '/' + username);
    } else {
      res.json('남은 콩이 모자라요. 뒤로 다시 돌아가주세요');
    }
  });
};