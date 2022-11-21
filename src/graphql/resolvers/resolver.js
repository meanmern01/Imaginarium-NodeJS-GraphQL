const UserAuth = require('../../model/Auth')
var validator = require('validator');
var bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken");

const extime = 10 * 60 * 60;
const genratetoken = (id) => {
  return jwt.sign({ id },'Imaginarium-GraphQL', {
    expiresIn: extime,
  });
};

const resolvers = {
    Mutation:{
        signUp : async (parent, args)=>{
            let data;
            try {
                const {username, email, password, conpassword} = args;
                if(!username || !email || !password || !conpassword){
                    return console.log("Please Enter All Details")
                }
                if(!validator.isEmail(email)){
                    return console.log("Enter Valid Email")
                }
                const user = await UserAuth.findOne({email:email})
                if(user){
                    return console.log("User Is Alredy Exists")
                }
                const strongPassword = new RegExp(
                    "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})"
                    );
                  if (!strongPassword.test(password.trim())) {
                    return console.log("Password must be at least 8 characters long with one uppercase letter, one lowercase letter, one digit, and one special character !")
                  }
                if(password != conpassword){
                    return console.log("Confirm Password Was Not Matched")
                }
                const hashpass = await bcrypt.hash(password, 10);
                await new UserAuth({
                    username, email, password : hashpass
                }).save().then((result) => {
                    data = result
                    console.log("User Create Successfully");
                }).catch((err) => {
                    return console.log(err.message)
                });                
            } catch (error) {
                return console.log(error.message)
            }
            return data;           
        },

        signIn : async (parent, args)=>{
            let data
            try {
                const {email, password} = args;
                if(!email || !password){
                    return console.log("Please Enter All Details")
                }
                if(!validator.isEmail(email)){
                    return console.log("Enter Valid Email")
                }
                const user = await UserAuth.findOne({email:email})
                if(!user){
                    return console.log("User Is Not Registered")
                }
                const strongPassword = new RegExp(
                    "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})"
                    );
                  if (!strongPassword.test(password.trim())) {
                    return console.log("Password must be at least 8 characters long with one uppercase letter, one lowercase letter, one digit, and one special character !")
                  }                
                const validate = await bcrypt.compare(password, user.password);
                if(!validate){
                    return console.log("Invalid Credentials");
                }
                let token = await genratetoken(user.id)
                await UserAuth.findByIdAndUpdate(
                    { _id: user.id },
                    { authToken: token },
                    { new: true }
                  )
                    .then((result) => {
                      data = result;
                      return console.log("User Login Successfully");
                    })
                    .catch((err) => {
                      return console.log(err.message);
                    });
            } catch (error) {
                return console.log(error.message)
            }
            return data 
        }
    }
}

module.exports = { resolvers }