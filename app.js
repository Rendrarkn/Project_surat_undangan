
const express = require('express');
const bodyParser = require('body-parser');
const invitationsRouter = require('./routes/invitations');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', invitationsRouter);

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
});
