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
    }
`

module.exports = { typeDefs }