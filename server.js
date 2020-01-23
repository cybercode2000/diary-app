const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.urlencoded({extended: false}));
app.use(express.static('public'));

app.set('view engine', 'ejs')

fs.readFile('./txt/app to be build.txt', 'utf-8', (err, result ) => {
    console.log(result);
})

app.get('/', (req,res) => {
    fs.readdir('./txt', ((err, result) => {
        files = result
        res.render('index.ejs', {
            result
     });   
    }))
})

app.get('/newfile', (req,res) => {
    res.render('newfile.ejs')
})

app.post('/newfile', (req,res) => {
    const {text, docname} = req.body
    const error = [];
    const success = [];

    if(!text || !docname){
        error.push({msg: 'please enter a valid document name'});
    }
    fs.writeFileSync(`./txt/${docname}.txt`, text)
        success.push({msg: "successfully created"});
        res.render('newfile.ejs', {
            success,
            error
        })

})

app.post('/:id', (req,res) => {
    fs.readdir('./txt', ((err, result) => {
        let coming = req.params.id
        result.forEach(doc => {
            if(doc.slice(0,-4) == coming){
                fs.unlink(`./txt/${coming}.txt`, (err, result) => {
                    res.redirect('/');
                })
            }
        })
    }))
})

app.post('/:id/edit', (req,res) => {
    fs.readdir('./txt', ((err, result) => {
        let coming = req.params.id
        result.forEach(doc => {
            if(doc.slice(0,-4) == coming){
                fs.readFile(`./txt/${coming}.txt`, 'utf-8', (err,m) => {
                    res.render('edit.ejs', {
                        m: m.trim(),
                        coming
                    })
                })
            }
        })
    }))
})


app.post('/:id/update', (req,res) => {
    fs.readdir('./txt', ((err, result) => {
        let coming = req.params.id
        result.forEach(doc => {
            if(doc.slice(0,-4) == coming){
                fs.unlink(`./txt/${coming}.txt`, (err, result) => {
                    if(err) throw err;
                    fs.writeFile(`./txt/${req.body.docname}.txt`, req.body.text, (err, resut) => {
                        res.render('single.ejs', {
                            m: req.body.text,
                            coming: req.body.docname
                        });
                    })
                })
            }
        })
    }))
})

app.get('/signup', (req,res) => {
    res.render('signup.ejs');
})

app.get('/:id', (req,res) => {
    fs.readdir('./txt', ((err, result) => {
        let coming = req.params.id
        result.forEach(doc => {
            if(doc.slice(0,-4) == coming){
                fs.readFile(`./txt/${doc}`, (err, m) => {
                    if(err) throw err;
                    res.render('single.ejs', {
                        m, 
                        coming
                    });
                })
            }
        })
    }))

})



const port = process.env.port || 3000

app.listen(3000, () => {
    console.log('app now listen @ port ' + port)
})