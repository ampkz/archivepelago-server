const app = require('./server/server');

app.listen(process.env.PORT, err => {if(err) console.log(err); else { console.log(`listening on port ${process.env.PORT}`) }});