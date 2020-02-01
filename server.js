const express = require('express');
const fs = require('fs');
const app = express();
const Joi = require('joi');
const flash = require('express-flash');
const session = require('express-session');
const passport = require('passport');

app.use(express.urlencoded({extended: false}));
app.use(express.static('public'));

app.set('view engine', 'ejs');

require('./config/passport')(passport);



app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,

}))

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// app.get('/', (req,res) => {
//     fs.readdir('./txt', ((err, result) => {
//         files = result
//         res.render('index.ejs', {
//             result
//      });   
//     }))

// })

app.get('/admin', checkauthenticated, (req,res) => {
    res.render('admin.ejs', {
        name: req.user.fname
    });
})

app.post('/signup', isNotAuthenticated, async(req,res) => {
    let {fname, lname, email, phone, password} = req.body
    const error = [];
    // const password1 = await bcrypt.hash(password, 10);
    if(!fname || !lname || !email || !phone || !password){
        error.push({msg: 'Please fill all the field'});
        res.render('signup.ejs', {
            error
        })
    }

    const schemaJoi = Joi.object().keys({
        fname: Joi.string().min(3).required(),
        lname: Joi.string().required(),
        email: Joi.string().trim().email().required(),
        phone: Joi.string().required(),
        password: Joi.string().min(5).max(15).required()
    });

    Joi.validate(req.body, schemaJoi, (err,result)=> {
        if(err){
            error.push({msg: err.details[0].message});
            res.render('signup.ejs', {
                error
            })
        }
    })

    if(typeof phone === 'undefined'){
        error.push({msg: 'phone number must be 11 number'});
            res.render('signup.ejs', {
                error
            })
    }
    else {
        fs.readFile(`./dami.json`, 'utf-8',(err,result) => {
            if(err){
                throw err;
            }
            else {
                const User = JSON.parse(result);
                const newUser = User.user;
                for(let key of newUser){
                    if(key.email === email){
                        error.push({msg: 'Email Already Exist'})
                        return res.render('signup.ejs', {
                            error
                        })
                    }
                    
                }


                const singleUser = {
                    id: Date.now(),
                    fname,
                    lname,
                    email,
                    phone,
                    password, 
                    memories: []
                }
                newUser.push(singleUser);
                fs.writeFileSync('./dami.json', JSON.stringify(User));
                const success = [];
                success.push({msg: "you can now login with your newly created account"});
                res.render('signin.ejs', {
                    success
                });

            }   
        })
    }

})


app.get('/login', isNotAuthenticated, (req,res) => {
    res.render('signin.ejs')
});


app.post('/login', isNotAuthenticated,
    passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: true
    })
    
)



// app.post('/:id', (req,res) => {
//     fs.readdir('./txt', ((err, result) => {
//         let coming = req.params.id
//         result.forEach(doc => {
//             if(doc.slice(0,-4) == coming){
//                 fs.unlink(`./txt/${coming}.txt`, (err, result) => {
//                     res.redirect('/');
//                 })
//             }
//         })
//     }))
// })

// app.post('/:id/edit', (req,res) => {
//     fs.readdir('./txt', ((err, result) => {
//         let coming = req.params.id
//         result.forEach(doc => {
//             if(doc.slice(0,-4) == coming){
//                 fs.readFile(`./txt/${coming}.txt`, 'utf-8', (err,m) => {
//                     res.render('edit.ejs', {
//                         m: m.trim(),
//                         coming
//                     })
//                 })
//             }
//         })
//     }))
// })


// app.post('/:id/update', (req,res) => {
//     fs.readdir('./txt', ((err, result) => {
//         let coming = req.params.id
//         result.forEach(doc => {
//             if(doc.slice(0,-4) == coming){
//                 fs.unlink(`./txt/${coming}.txt`, (err, result) => {
//                     if(err) throw err;
//                     fs.writeFile(`./txt/${req.body.docname}.txt`, req.body.text, (err, resut) => {
//                         res.render('single.ejs', {
//                             m: req.body.text,
//                             coming: req.body.docname
//                         });
//                     })
//                 })
//             }
//         })
//     }))
// })

app.get('/signup', isNotAuthenticated, (req,res) => {
    res.render('signup.ejs');
})

// app.get('/:id', (req,res) => {
//     fs.readdir('./txt', ((err, result) => {
//         let coming = req.params.id
//         result.forEach(doc => {
//             if(doc.slice(0,-4) == coming){
//                 fs.readFile(`./txt/${doc}`, (err, m) => {
//                     if(err) throw err;
//                     res.render('single.ejs', {
//                         m, 
//                         coming
//                     });
//                 })
//             }
//         })
//     }))

// })

const error = [];
app.post('/logout', (req,res) => {
    req.logOut();
    res.redirect('/login')
})

function checkauthenticated(req,res,next) {
    if(req.isAuthenticated()) {
        return next()
    }
    error.push({msg: "Please Login First"})
    res.render('signin.ejs', {
        error
    })
}

function isNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        res.redirect('/admin');
    }
    else {
        return next();
    }
}


const port = process.env.port || 3000

app.listen(3000, () => {
    console.log('app now listen @ port ' + port)
})