const joy = require ('joi');

const leavevalidation = join.Object ({

     type :  joi.string()
        .valid("Annual", "Sick", "Casual", "Unpaid")
        .required()
});


module.exports = { leavevalidation };
