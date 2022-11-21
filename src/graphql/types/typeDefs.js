const { gql } = require("apollo-server");

const typeDefs = gql`
    type User {
        id:ID!
        username:String!
        email:String!
        password:String!
        conpassword:String!
    }   
    type Query {
        getUser: [User!]
    }
    type Mutation {
        signUp(username:String,email:String,password:String,conpassword:String):User
    }

`

module.exports = { typeDefs }