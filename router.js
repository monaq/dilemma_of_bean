module.exports = function(app, fs) {
  app.get("/", (req, res) => {
    // res.render("index.html");
    res.render("index", {
      title: "콩의 딜레마 - index",
      length: 5
    });
  });

  app.get("/game/:team/:user", (req, res) => {
    res.render("game", {
      title: "콩의 딜레마 - game",
      team: req.params.team,
      user: req.params.user
    });
  });

  app.get("/game/wait", (req, res) => {
    res.render("wait", {
      title: "콩의 딜레마 - wait"
    });
  });

  app.get("/back/result", (req, res) => {
    fs.readFile(__dirname + "/db.json", "utf8", (err, data) => {
      res.end(data);
    });
  });

  app.get("/back/start", (req, res) => {
    res.render("start.html");
  });

  app.get("/back/time", (req, res) => {
    res.render("time.html");
  });

  app.get("/back/summary", (req, res) => {
    res.render("summary.html");
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

    fs.readFile(__dirname + "/db.json", "utf8", (err, data) => {
      const payload = JSON.parse(data);
      let remainBeans = payload[username].beans;
      if (remainBeans - beansCount > 0) {
        payload[username].beans = remainBeans - beansCount;
      } else {
        res.json('남은 콩이 모자라요. 뒤로 다시 돌아가주세요')  
      }

      fs.writeFile(
        __dirname + "/db.json",
        JSON.stringify(payload, null, "\t"),
        "utf8",
        function(err, data) {
          result = { success: 1 };
          console.log(payload);
          if (result.success === 1) {
            res.redirect("/game/wait");
          }
        }
      );
    });

    // res.redirect('/game/wait')
  });
};
