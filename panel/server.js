const express = require('express');
const { exec } = require('child_process');
const app = express()
const path = require('path');
const db = require('./database');
const bcrypt = require('bcrypt');

app.use(express.static(path.join(__dirname,'public')));

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

    if(match) {
        res.json({ message: 'Login succesful, welcome.'});
    } else {
        res.json({ message: 'Incorrect credentials. Try again.'});
    }

        });



app.post('/server/start', (req, res) => {
    exec('bash ./scripts/start.sh', (err, stdout, stderr) => {
        if(err){
            res.json({ message: 'Failed to start server: ' +stderr});
        } else {
            res.json({ message: 'Server has started successfully.'});
        }
    });
});

app.post('/server/stop', (req, res) => {
    exec('bash ./scripts/stop.sh', (err,stdout,stderr) => {
        if(err){
            res.json({ message: 'Failed to stop server:' + stderr});
        } else {
            res.json({ message: 'Server has stopped.'});
        }
    });
});
    
app.post('/server/restart', (req,res) => {
    exec('bash ./scripts/restart.sh', (err,stdout,stderr) => {
        if(err){res.json({ message: 'Failed to restart server:' + stderr});
    } else {
        res.json({ message: 'Server has restarted.'});
    }
        
    });
});
app.get('/server/status', (req,res) => {
    exec('bash ./scripts/status.sh', (err, stdout, stderr) => {
        if(err) {
            res.json({ status: 'unknown'});
        } else {
            res.json({ status: stdout.trim()});
        }
    });
});
app.listen(3000, () => {
    console.log('Access gateway at http://localhost:3000')
});