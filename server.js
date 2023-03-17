const serialize = require('serialize-javascript');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();

app.use(session({
    secret: 'keyboard cat',
    saveUninitialized: true,
}));

app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    
    let scriptElement = "<script>"
    if (req.session.username && req.session.picture) {
        scriptElement += "window.__SESSION__ ="
        try {
            scriptElement += serialize({
                username: req.session.username,
                picture: new URL(req.session.picture)
            })
        }
        catch (e) {
            req.session.username = null;
            req.session.picture = null;
            scriptElement += serialize({})
        }
    }
    scriptElement += "</script>"

    const html = `
        <html>
            <head>
                <title>serialize-javascript Server</title>
            </head>
            <body>
                <h1>serialize-javascript Server</h1>
                <form action="/" method="POST">
                    <label for="username">Username</label>
                    <input type="text" name="username" value="l337h4x0r" />
                    <label for="picture">Profile Picture URL</label>
                    <input type="picture" name="picture" value="https://www.hackerone.com/themes/hacker_one/images/logo-hackerone.svg" />
                    <input type="submit" value="Submit" />
                </form>
                ${scriptElement}
                <script>
                    if (window.__SESSION__.username && window.__SESSION__.picture) {
                        let header = document.createElement('h2');
                        header.innerText = "Welcome back, " + window.__SESSION__.username;
                        let img = document.createElement('img');
                        img.src = window.__SESSION__.picture;
                        document.body.appendChild(header);
                        document.body.appendChild(img);
                    }
                </script>
            </body>
        </html>
    `;

    res.send(html);
});

app.post('/', (req, res) => {
    req.session.username = req.body.username;
    req.session.picture = req.body.picture;
    res.redirect('/');
});

app.listen(3000, () => {
    console.log('Server listening on port 3000');
})