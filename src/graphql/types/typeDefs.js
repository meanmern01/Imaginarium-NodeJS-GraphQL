const { gql } = require("apollo-server");

const typeDefs = gql`
 scalar Upload
    type User {
        id:ID!
        username:String!
        email:String!
        password:String!
        authToken:String
        verify:Boolean      
        langauage:String
        image:String
        firstname:String
                
    }   
    type Auth{
        oldpassword:String
        conpassword:String
    }
    type Otp {
        otp:String
    }   
    type Query {
        getUser: [User!]
        logout(email:String!): [User!]
    }
     type Mutation {
        signUp(username:String!,email:String!,password:String!,conpassword:String!):User
        verifyUser(email:String,otp:String):Boolean
        signIn(email:String!,password:String!):User
        forgotPasswordOtp(email:String):Boolean
        verifyOtp(email:String,otp:String,password:String,conpassword:String):Boolean
        signUpbyGoogle(email:String):User
        signUpbyApple(email:String):User
        langauage(id:ID,langauage:String):Boolean
        editProfile(file: Upload,email:String,firstname:String,username:String,password:String,conpassword:String,oldpassword:String): User
    }
`

module.exports = { typeDefs }   