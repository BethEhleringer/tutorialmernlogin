const User = require('../../models/User');
const UserSession = require('../../models/UserSession')

module.exports = (app) => {

    app.post('/api/account/signup', (req, res, next) => {
        const { body } = req;
        console.log('body', body);
        const {
            firstName,
            lastName,
            password
        } = body;
        let {
            email
        } = body;


        if (!firstName) {
            return res.send({
                success: false,
                message: 'Error: Please enter first name.'
            });
        }


        if (!lastName) {
            return res.send({
                success: false,
                message: 'Error: Please enter last name.'
            });
        }


        if (!email) {
            return res.send({
                success: false,
                message: 'Error: Please enter email.'
            });
        }


        if (!password) {
            return res.send({
                success: false,
                message: 'Error: Please enter password.'
            });
        }
        console.log('here');
        email = email.toLowerCase();

        // Steps:
        // 1. Verify email doesn't exist
        // 2. Save

        User.find({
            email: email
        }, (err, previousUsers) => {
            if (err) {
                res.end('Error: Server error.');
            } else if (previousUsers.length > 0) {
                res.end('Error: Account already exists.');
            }

            // Save the new user
            const newUser = new User();

            newUser.email = email;
            newUser.firstName = firstName;
            newUser.lastName = lastName;
            newUser.password = newUser.generateHash(password);
            newUser.save((err, user) => {
                if (err) {
                    return res.send({
                        success: false,
                        message: 'Error: Server error'
                    });
                }
                return res.send({
                    success: true,
                    message: 'Signed up'
                })
            })

        })
    });

    app.post('/api/account/signin', (req, res, next) => {
        const { body } = req;
        const {
            password
        } = body;
        let {
            email
        } = body;

        if (!email) {
            return res.send({
                success: false,
                message: 'Error: Please enter email.'
            });
        }

        if (!password) {
            return res.send({
                success: false,
                message: 'Error: Please enter password.'
            });
        }

        email = email.toLowerCase();

        User.find({
            email: email
        },
            (err, users) => {
                if (err) {
                    return res.send({
                        success: false,
                        message: 'Error: Server error'
                    })
                }
                if (users.length != 1) {
                    return res.send({
                        success: false,
                        message: 'Error: invalid'
                    })
                }

                const user = users[0];
                if (!user.validPassword(password)) {
                    return res.send({
                        success: false,
                        message: 'Error: invalid password'
                    })
                }

                const userSession = new UserSession();
                userSession.userId = user._id;
                userSession.save((err, doc) => {
                    if (err) {
                        console.log(err)
                        return res.send({
                            success: false,
                            message: 'Error: server error'
                        });
                    }

                    return res.send({
                        success: true,
                        message: 'Valid signin',
                        token: doc._id
                    })
                })
            }
        )

    });

    //verify - get the token and verify the token is one of a kind
    app.get('/api/account/verify', (req, res, next) => {

        const { query } = req;
        const { token } = query;

        UserSession.find({
            _id: token,
            isDeleted: false,
        }, (err, sessions) => {
if (err) {
    return res.send({
        success: false,
        message: 'Error: server error'
    });
}
    if (sessions.length != 1) {
        return res.send({
            success: false,
            message: 'Error: invalid'
        })
    } else {
        return res.send({
            success: true,
            message: 'Good'
        })
    }
    


    });

});


    //end verify

//logout
app.get('/api/account/logout', (req, res, next) => {
    const { query } = req;
    const { token } = query;

    UserSession.findOneAndUpdate({
        _id: token,
        isDeleted: false,
    }, {
        $set: {
            isDeleted:true
        }
    }, null, (err, sessions) => {
if (err) {
return res.send({
    success: false,
    message: 'Error: server error'
});
}
if (sessions.length != 1) {
    return res.send({
        success: false,
        message: 'Error: invalid'
    })
} else {
    return res.send({
        success: true,
        message: 'Good'
    })
}



});

});
//end logout
}



