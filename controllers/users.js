const User = require('../models/user');

module.exports = {
    index,
    edit,
    update,
    destroy,
};

// show index (all users) function
async function index(req, res) {
    // get all users from database and store them in constant users
    const users = await User.find({});
    //render users/index page and pass title "all users" and users constant
    res.render('users/index', { title: 'All Users', users });
}

// show edit page with user info function
async function edit(req, res) {
    // get selected user from database using id from req.params.id and store it in constant user
    const user = await User.findById(req.params.id); 
    // if user was aquired from database
    if (user) {
        // render users/edit page and pass title "User Details" and user constant
        res.render('users/edit', { title: 'User Details', user});
    }
    // else
    else {
        // return to all users and pass errMsg user not found
        console.log("user not found")
        res.redirect('/users');
    }
}

// update user function
async function update(req, res) {

    // Remove empty properties so that defaults will be applied
    for (let key in req.body) {
        if (req.body[key] === '') delete req.body[key];
    }

    try {
        // update restaurant in database using req.params.id as _id
        const result = await User.updateOne({_id: req.params.id}, req.body);
        // redirect to users index page
        res.redirect(`/users`);
    } catch (err) {
        // if failed return to the edit page
        console.log(err);
        res.redirect(`/users/${req.params.id}/edit`);
    }
}

// Delete user from database function
async function destroy(req, res) {
    try {
        // delete the user using req.params.id as _id
        const result = await User.deleteOne({_id: req.params.id}); 
        // redirect to users index
        res.redirect('/users');
    // if failed
    }catch(err) {
        console.log(err);
        // redirect to users index
        res.redirect('/users');
    }
}