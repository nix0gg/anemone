const express = require('express');
const app = express()
const path = require('path');

app.use(express.static(path.join(__dirname,'public')));

app.use(express.json());

app.get('/ping', (req, res) => {
    res.send('Server is running')
});

app.listen(3000, () => {
    console.log('Access gateway at http://localhost:3000')
});
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if(username==='admin' &&password ==='admin')
    {
        res.json({message: "Login successful, welcome."});}

        else{

        
            res.json({message:'Incorrect credentials. Try again.'});
        }

        });

    
