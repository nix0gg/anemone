require('dotenv').config();
const express = require('express');
const { exec } = require('child_process');
const app = express()
const path = require('path');
const db = require('./database');
const bcrypt = require('bcrypt');
const session = require('express-session');

app.use(express.static(path.join(__dirname,'public')));
app.use(session({
    secret : 'anemoney_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {secure: false}
}));

function requireLogin(req, res, next) {
    if (req.session && req.session.user) {
        const activeSession = db.prepare('SELECT * FROM active_sessions WHERE username = ?').get(req.session.user.username);
        
        if (activeSession && activeSession.session_id === req.session.id) {
            next();
        } else {
            req.session.destroy();
            if (req.path.startsWith('/server/')) {
                res.status(401).json({ message: 'Session expired.' });
            } else {
                res.redirect('/');
            }
        }
    } else {
        if (req.path.startsWith('/server/')) {
            res.status(401).json({ message: 'Not logged in.' });
        } else {
            res.redirect('/');
        }
    }
}
app.use(express.json());

app.get('/ping', (req, res) => {
    res.send('Server is running')
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if(!user) {
        return res.json({ message: 'Incorrect credentials. Try again.'});    
    }

    const match = bcrypt.compareSync(password, user.password);
if (match) {
    const existingSession = db.prepare('SELECT * FROM active_sessions WHERE username = ?').get(user.username);
    
    if (existingSession) {
        db.prepare('UPDATE active_sessions SET session_id = ? WHERE username = ?')
          .run(req.session.id, user.username);
    } else {
        db.prepare('INSERT INTO active_sessions (username, session_id) VALUES (?, ?)')
          .run(user.username, req.session.id);
    }

    req.session.user = { username: user.username, role: user.role };
req.session.save(() => {
    res.json({ message: 'Login successful, welcome.' });
});
}

        });



app.post('/server/start', requireLogin, (req, res) => {
    exec('bash ./scripts/start.sh', (err, stdout, stderr) => {
        if(err){
            res.json({ message: 'Failed to start server: ' +stderr});
        } else {
            res.json({ message: 'Server has started successfully.'});
        }
    });
});

app.post('/server/stop', requireLogin, (req, res) => {
    exec('bash ./scripts/stop.sh', (err,stdout,stderr) => {
        if(err){
            res.json({ message: 'Failed to stop server:' + stderr});
        } else {
            res.json({ message: 'Server has stopped.'});
        }
    });
});
    
app.post('/server/restart', requireLogin, (req,res) => {
    exec('bash ./scripts/restart.sh', (err,stdout,stderr) => {
        if(err){res.json({ message: 'Failed to restart server:' + stderr});
    } else {
        res.json({ message: 'Server has restarted.'});
    }
        
    });
});
app.get('/server/status', requireLogin, (req,res) => {
    exec('bash ./scripts/status.sh', (err, stdout, stderr) => {
        if(err) {
            res.json({ status: 'unknown'});
        } else {
            res.json({ status: stdout.trim()});
        }
    });
});

app.get('/dashboard.html', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname,'dashboard.html'));
});


app.listen(3000, () => {
    console.log('Access gateway at http://localhost:3000')
});


