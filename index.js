const app = require('./server/server');

// eslint-disable-next-line no-undef
app.listen(process.env.PORT, err => {if(err) console.log(err); else { console.log(`listening on port ${process.env.PORT}`) }});