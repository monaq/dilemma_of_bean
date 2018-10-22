module.exports = function(app, fs)
{
     app.get('/', (req,res) => {
        res.render('index.html')
     })

     app.get('/game/:team/:user', (req,res) => {
        res.send("tagId is set to " + req.params.team + ' and ' + req.params.user);
     })

     app.get('/back/result', (req,res) => {
        fs.readFile( __dirname + "/" + "db.json", 'utf8', (err, data) => {
            console.log( data )
            res.end( data )
        })
    })

    app.post('/write', (req, res) => {
        console.log(req.body)
        res.send(req.body)
    })

    
}