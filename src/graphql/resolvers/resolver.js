const UserAuth = require("../../model/Auth");
const OtpData = require("../../model/Otp");
const Feedback = require("../../model/Feedback");
const Moviedata = require("../../model/Movie");
var validator = require("validator");
var bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const { SendEmail } = require("../../utils/nodemailer");

const extime = 10 * 60 * 60;
const genratetoken = (id) => {
  return jwt.sign({ id }, "Imaginarium-GraphQL", {
    expiresIn: extime,
  });
};

const resolvers = {
  Query: {
    getUser: async () => {
      const users = await UserAuth.find();
      return users;
    },

    logout: async (_,args)=>{
      const user = await UserAuth.findOneAndUpdate({email:args.email},{authToken:null},{new:true})
      .then((result)=>{
        return console.log("User LogOut Successfully...");
      }).catch((err)=>{
        return console.log(err.message);        
      })
    },

    getMovie: async (_,args)=>{
      const data = await Moviedata.find({author:args.email})
      return data
    }
  },

  Mutation: {
    signUp: async (parent, args) => {
      let data;
      try {
        const { username, email, password, conpassword } = args;
        if (!username || !email || !password || !conpassword) {
          return console.log("Please Enter All Details");
        }
        if (!validator.isEmail(email)) {
          return console.log("Enter Valid Email");
        }
        const user = await UserAuth.findOne({ email: email });
        if (user) {
          return console.log("User Is Alredy Exists");
        }
        const strongPassword = new RegExp(
          "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})"
        );
        if (!strongPassword.test(password.trim())) {
          return console.log(
            "Password must be at least 8 characters long with one uppercase letter, one lowercase letter, one digit, and one special character !"
          );
        }
        if (password != conpassword) {
          return console.log("Confirm Password Was Not Matched");
        }
        let otp = await otpGenerator.generate(6, {
          lowerCaseAlphabets: false,
          upperCaseAlphabets: false,
          specialChars: false,
        });
        const hashpass = await bcrypt.hash(password, 10);
        const hashotp = await bcrypt.hash(otp, 10);
        await new UserAuth({
          username,
          email,
          password: hashpass,
        })
          .save()
          .then((result) => {
            data = result;
            SendEmail(email, "Verify User", otp);
            new OtpData({ email, otp: hashotp }).save().then(() => {
              console.log("User Created Please Check Your Mail....");
            });
          })
          .catch((err) => {
            return console.log(err.message);
          });
      } catch (error) {
        return console.log(error.message);
      }
      return data;
    },

    verifyUser: async (parent, args) => {
      try {
        const { email, otp } = args;
        const user = await UserAuth.findOne({ email: email });
        if (!user) {
          return console.log("User Is Not Registered...");
        }
        const UserOtp = await OtpData.findOne({ email: email });
        if (!UserOtp) {
          return console.log("Otp Is Not Genrated...");
        }
        if (UserOtp.expiresAt < Date.now()) {
          return console.log("Otp Is Expired...");
        }
        const validate = await bcrypt.compare(otp, UserOtp.otp);
        if (!validate) {
          return console.log("Enter Valid Otp...");
        }
        await UserAuth.findOneAndUpdate(
          { email: email },
          { $set: { verify: true } },
          { new: true }
        ).then(() => {
          OtpData.findOneAndDelete({ email: email }).then(() => {
            return console.log("User Verified Successfully...");
          });
        });
      } catch (error) {
        return console.log(error.message);
      }
      return "Success";
    },

    signIn: async (parent, args) => {
      let data;
      try {
        const { email, password } = args;
        if (!email || !password) {
          return console.log("Please Enter All Details...");
        }
        if (!validator.isEmail(email)) {
          return console.log("Enter Valid Email...");
        }
        const user = await UserAuth.findOne({ email: email });
        if (!user) {
          return console.log("User Is Not Registered...");
        }
        const strongPassword = new RegExp(
          "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})"
        );
        if (!strongPassword.test(password.trim())) {
          return console.log(
            "Password must be at least 8 characters long with one uppercase letter, one lowercase letter, one digit, and one special character !..."
          );
        }
        const validate = await bcrypt.compare(password, user.password);
        if (!validate) {
          return console.log("Invalid Credentials...");
        }
        if (user.verify != true) {
          return console.log("User Is Not Verified...");
        }
        let token = await genratetoken(user.id);
        await UserAuth.findByIdAndUpdate(
          { _id: user.id },
          { authToken: token },
          { new: true }
        )
          .then((result) => {
            data = result;
            return console.log("User Login Successfully...");
          })
          .catch((err) => {
            return console.log(err.message);
          });
      } catch (error) {
        return console.log(error.message);
      }
      return data;
    },

    forgotPasswordOtp: async (parent, args) => {
      try {
        const { email } = args;
        const user = await UserAuth.findOne({ email: email });
        if (!user) {
          return console.log("User Register First!!");
        }
        let otp = await otpGenerator.generate(6, {
          lowerCaseAlphabets: false,
          upperCaseAlphabets: false,
          specialChars: false,
        });
        await SendEmail(user.email, "Verification Mail", otp);
        let hashOtp = await bcrypt.hash(otp, 10);
        await new OtpData({
          email,
          otp: hashOtp,
          createdAt: Date.now(),
          expiresAt: Date.now() + 1000 * 60 * 60,
        })
          .save()
          .then(() => {
            console.log("Otp Send Successfully");
          });
      } catch (error) {
        return console.log(error.message);
      }
      return null;
    },

    verifyOtp: async (parent, args) => {
      try {
        const { otp, password, conpassword, email } = args;
        const userOtp = await OtpData.findOne({ email: email });
        if (!userOtp) {
          return console.log("Otp is Expired in DB");
        }
        if (userOtp.expiresAt < Date.now()) {
          await OtpData.findOneAndDelete({ email: email }).then(() => {
            return console.log("Otp is Expired");
          });
        }
        let validate = await bcrypt.compare(otp, userOtp.otp);
        if (!validate) {
          return console.log("Enter Valid Otp!!");
        }
        const strongPassword = new RegExp(
          "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})"
        );
        if (!strongPassword.test(password.trim())) {
          return console.log(
            "Password must be at least 8 characters long with one uppercase letter, one lowercase letter, one digit, and one special character !"
          );
        }
        if (password != conpassword) {
          return console.log("Confirm Password Was Not Matched");
        }
        const hashpass = await bcrypt.hash(password, 10);
        await UserAuth.findOneAndUpdate(
          { email: email },
          { password: hashpass },
          { new: true }
        )
          .then((result) => {
            OtpData.findOneAndDelete({ email: email }).then(() => {
              return console.log("Password Update Successfully");
            });
          })
          .catch((err) => {
            return console.log(err.message);
          });
      } catch (error) {
        return console.log(error.message);
      }
      return null;
    },

    signUpbyGoogle: async (parent, args) => {
      let data;
      try {
        const { email } = args;
        let user = await UserAuth.findOne({ email: email });
        if (user) {
          return console.log("User Is Already Existes...");
        }
        token = genratetoken(email);
        await new UserAuth({ ...args, authToken: token, verify: true })
          .save()
          .then((result) => {
            data = result;
            return console.log("User Login Successfully");
          });
      } catch (error) {
        return console.log(error.message);
      }
      return data;
    },

    signUpbyApple: async (parent, args) => {
      let data;
      try {
        const { email } = args;
        let user = await UserAuth.findOne({ email: email });
        if (user) {
          return console.log("User Is Already Existes...");
        }
        token = genratetoken(email);
        await new UserAuth({ ...args, authToken: token, verify: true })
          .save()
          .then((result) => {
            data = result;
            return console.log("User Login Successfully");
          });
      } catch (error) {
        return console.log(error.message);
      }
      return data;
    },

    langauage: async (parent, args) => {
      let data;
      try {
        const { id, langauage } = args;
        await UserAuth.findOneAndUpdate(
          { id: id },
          { $set: { langauage: langauage } },
          { new: true }
        ).then((result) => {
          data = result;
          console.log("Langauage Added Successfully");
        });
      } catch (error) {
        return console.log(error.message);
      }
      return data;
    },

    editProfile: async (parent, args) => {
      try {
        const {
          email,
          username,
          firstname,
          oldpassword,
          password,
          conpassword,
          file,
        } = args;
        const user = await UserAuth.findOne({ email: email });
        if (!user) {
          return console.log("User Is Does't Exists...");
        }
        if (user.verify != true) {
          return console.log("User Is Not Verified...");
        }
        const strongfirstname = new RegExp("(?=.*[a-z])(?=.*[^a-z])(?=.{6,})");
        if (!strongfirstname.test(firstname)) {
          return res
            .status(400)
            .json({
              message:
                "Firstname must have 6 character include(alphabate and special character)",
            });
        }
        if (user.email == email) {
          if (!oldpassword) {
            await UserAuth.findOneAndUpdate(
              { email: email },
              { username: username, firstname: firstname, file: file },
              { new: true }
            )
              .then((result) => {
                return console.log("UserDetails Update Successfully...");
              })
              .catch((err) => {
                return console.log(err.message);
              });
          } else {
            const valid = await bcrypt.compare(oldpassword, user.password);
            if (!valid) {
              return console.log("OldPassword Is Wrong...");
            }
            const strongPassword = new RegExp(
              "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})"
            );
            if (!strongPassword.test(password.trim())) {
              return console.log(
                "Password must be at least 8 characters long with one uppercase letter, one lowercase letter, one digit, and one special character !"
              );
            }
            if (password !== conpassword) {
              return console.log("NewPasswords Were Not Matched...");
            }
            const hashpassword = await bcrypt.hash(password, 10);
            await UserAuth.findOneAndUpdate(
              { email: email },
              {
                email: email,
                username: username,
                firstname: firstname,
                password: hashpassword,
                file: file,
              }
            )
              .then((result) => {
                return console.log("UserCredentils Update Successfully...");
              })
              .catch((err) => {
                return console.log(err.message);
              });
          }
        }
      } catch (error) {
        console.log(error.message);
      }
    },

    feedback: async (parent, args)=>{
      let data
      const {user,type,question,description} = args
      const userData = await UserAuth.findOne({email:user})
      if(!userData){
        return console.log("User Is Not Exists...");
      }
      await new Feedback ({
        user,type,question,description
      }).save().then((result)=>{
        data = result
       return console.log("FeedBack Store Successfully...");
      }).catch((err)=>{
        return console.log(err.message);
      })
      return data
    },

    addNewMovie: async (parent, args)=>{
      let data
      try {
        const {type,moviebanner,title,tagline,synopsis,logline,genres,tags,actors,similarmovies,author,screenplay} = args
        const user = await UserAuth.findOne({ email: author });
        if (!user) {
          return console.log("User Doesn't Exists...");
        }
        if (user.verify != true) {
          return console.log("User Doesn't Verify...");
        }
        const Movie = await Moviedata.findOne({ title: title });
        if (Movie) {
          const userMovie = await Moviedata.findOne({ author: author });
          if (userMovie) {
            return console.log(
              "You Can't Create Movie This Same Name, Try With Another..."
            );
          } else {
            await new Moviedata({
              ...args,
            })
              .save()
              .then((result) => {
                data = result;
              })
              .catch((err) => {
                return console.log(err.message);
              });
          }
        } else {
          await new Moviedata({
            ...args,
          })
            .save()
            .then((result) => {
              data = result;
            })
            .catch((err) => {
              return console.log(err.message);
            });
        }
      } catch (error) {
        return console.log(error.message);
      }
      return data
    },

    addNewActor: async (parent, args)=>{
      try {        
        const {actorname,heroname,actorDescription,actorImage} = args
        Actor = {
          actorname,heroname,actorDescription,actorImage
        }
      } catch (error) {
        return console.log(error.message);
      }
      return Actor
    }
    



  },
};
module.exports = { resolvers };
