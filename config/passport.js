const LocalStrategy = require('passport-local').Strategy;
const fs = require('fs');



module.exports = function(passport) {
    fs.readFile(`./dami.json`, 'utf-8',(err,result) => {
        const us = '';
        const user = JSON.parse(result);
        const User = user.user;
        console.log(User);
        User.find(user => {
        passport.use(new LocalStrategy({usernameField: 'email'}, (email,password,done) => {
             
            
                if(user.email !== email){
                    return done(null, false, {message: 'Please Enter a valid Email'})
                }
                else {
                    if(user.password == password){
                        return done(null, user);    
                        us = mainUser
                    }
                    else {
                        return done(null, false, {message: 'Password incorrect'})
                    }
    
                }
           

            
        }));
        passport.serializeUser((user, done) => {
        done(null, user.id);
    })
    passport.deserializeUser((id, done) => {
            done(err, user)
    })
    })
    })

}
