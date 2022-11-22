const { gql } = require("apollo-server");

const typeDefs = gql`
    type User {
        id:ID!
        username:String!
        email:String!
        password:String!
        conpassword:String
        authToken:String
        verify:Boolean      
        langauage:String        
    }
    type Otp {
        otp:String
    }   
    type Query {
        getUser: [User!]
    }
    type Mutation {
        signUp(username:String!,email:String!,password:String!,conpassword:String!):User
        verifyUser(email:String,otp:String):User
        signIn(email:String!,password:String!):User
        forgotPasswordOtp(email:String):User
        verifyOtp(email:String,otp:String,password:String,conpassword:String):User
        signUpbyGoogle(email:String):User
        signUpbyApple(email:String):User
        langauage(id:ID,langauage:String):User
    }
`

module.exports = { typeDefs }   