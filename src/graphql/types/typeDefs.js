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
    type Feedback {
        user:String
        type:String
        question:String
        description:String
    } 
    type Auth{
        oldpassword:String
        conpassword:String
    }
    type Otp {
        otp:String
    } 
    type Logline {
        incitingIncident:String
        protagonist:String
        action:String
        antagonist:String
    } 
    type Actor {
        actorname:String
        heroname:String
        actorDescription:String
        actorImage:String
    }
    type Genres { 
        name:[String]
    }
    type SimilarMovie {
        moviebanner:String
        moviename:String
    } 
    type Act {
        actName: String
        Scenes:[Scene]
    }
    type Scene {
        sceneName:String
        description:String
        actors:[Actor]
    }  
    type Movie {
        moviebanner:String!
        title:String!
        type:String!
        logline:Logline
        tagline:String
        synopsis:String
        actors:[Actor]
        author:String
        tags:[String]
        genres:[Genres]
        similarmovies:[SimilarMovie]
        screenplay:[Act]
    } 
    input LoglineInput {
        incitingIncident:String
        protagonist:String
        action:String
        antagonist:String
    } 
    input ActorInput {
        actorname:String
        heroname:String
        actorDescription:String
        actorImage:String
    }
    input GenresInput { 
        name:[String]
    }
    input SimilarMovieInput {
        moviebanner:String
        moviename:String
    } 
    input ActorInput {
        actName: String
        Scenes:[SceneInput]
    }
    input SceneInput {
        sceneName:String
        description:String
        actors:[ActorInput]
    }   
    type Query {
        getUser: [User!]
        logout(email:String!): [User!]
        getMovie(email:String!): [Movie]
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
        feedback(user:String,type:String,question:String,description:String):Feedback
        addNewMovie(type:String!,moviebanner:String!,title:String!,tagline:String,synopsis:String,logline:LoglineInput,genres:[GenresInput],tags:[String],actors:[ActorInput],similarmovies:[SimilarMovieInput],author:String,screenplay:[ActorInput]):Movie
        addNewActor(actorname:String,heroname:String,actorDescription:String,actorImage:String):Actor
    }
`

module.exports = { typeDefs }   