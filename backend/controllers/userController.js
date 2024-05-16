const userModel = require("../models/userModel")
const otpGenerator = require("otp-generator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const otpModel = require("../models/otpModel")

const nodemailer = require('nodemailer');


exports.userByIdController = async (req, res) => {
    try {
        const user = req.params.id;
        // console.log('user', user)
        if (!user) {
            return res.status(400).send({
                success: false,
                message: "enter valid to continue"
            })
        }


        const existUser = await userModel.findById(user).populate("posts").populate("followers").populate({
            path: 'following',
            populate: {
                path: 'story' // Specify the path to the nested schema you want to populate
            }
        }).populate("story");
        // console.log('existUser', existUser)
        if (!existUser) {
            return res.status(400).send({
                success: false,
                message: "Number is not resistered"
            })
        }
        return res.status(201).send({
            success: true,
            message: "profile details got successfully    ",
            existUser
        })
    }
    catch (error) {
        console.log('error', error)
        return res.status(400).send({
            success: false,
            message: "something went wrong",
            error
        })
    }
}
exports.loginUserController = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).send({
                success: false,
                message: "enter valid email to continue"
            })
        }

        const emailid = email.toLowerCase()
        const existUser = await userModel.findOne({ email: emailid });
        // console.log('existUser', existUser)
        if (!existUser) {
            return res.status(400).send({
                success: false,
                message: "Email is not resistered"
            })
        }





        const otp = otpGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
        const salt = await bcrypt.genSalt(10);
        const newOtp = await bcrypt.hash(otp, salt);
        await otpModel.findOneAndUpdate({
            email
        }, { otp: newOtp, expireTime: new Date(new Date().getTime()) },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.AUTH,
                pass: process.env.PASS
            }
        });
        const mailOptions = {
            from: `Online Examination`,
            to: email, // Your email address
            subject: `otp for login`,
            text: `Your OTP for login is  ${otp}`,
        };

        const info = await transporter.sendMail(mailOptions);

        res.status(201).send({
            success: true,
            message: "otp sent successfully    "
        })
    } catch (error) {
        console.log('error', error)
        res.status(400).send({
            success: false,
            message: "something went wrong",
            error
        })
    }
}
exports.getAllUsersController = async (req, res) => {
    try {
        const usersWithoutPasswords = await userModel.find().populate("posts").populate("followers").populate("following").populate("story");
        if (usersWithoutPasswords) {
            // console.log('allUser', allUser)
            // const usersWithoutPasswords = allUser.map(user => {
            //     return { ...user, password: undefined };
            // });
            // console.log('usersWithoutPasswords', usersWithoutPasswords)
            return res.status(201).send({
                success: true,
                message: "all users got successfully   ",
                usersWithoutPasswords
            })
        }

    } catch (error) {
        console.log('error', error)
        res.status(400).send({
            success: false,
            message: "something went wrong",
            error
        })
    }
}

exports.otpVerifyController = async (req, res) => {
    try {
        const { otp, phone } = req.body;
        console.log('req.body', req.body)
        // console.log('otp', otp)
        if (!otp) {
            return res.status(400).send({
                success: false,
                message: " Otp is not getting"
            })
        }


        const existOtp = await otpModel.findOne({ phone });
        // console.log('existOtp', existOtp)
        if (!existOtp) {
            return res.status(400).send({
                success: false,
                message: "Number is not resistered"
            })
        }

        const compared = await bcrypt.compare(otp, existOtp?.otp)

        if (compared) {
            const user = await userModel.findOne({ email: phone }).populate("posts").populate("followers").populate("following");
            const { password, ...info } = user._doc;
            const accessToken = jwt.sign({ id: user._id }, "secretKey1234", { expiresIn: "5d" });
            return res.status(201).send({
                message: "login successful",
                success: true,
                info, accessToken
            })

        }
        res.status(400).send({
            success: true,
            message: "wrong otp"
        })
    } catch (error) {
        console.log('error', error)
        res.status(400).send({
            success: false,
            message: "something went wrong",
            error
        })
    }
}
exports.signUpUserController = async (req, res) => {
    try {
        console.log('req.body', req.body)
        const { name, email, phone, password } = req.body;
        if (!phone || !name || !email || !password) {
            return res.status(400).send({
                success: false,
                message: "enter valid document to continue"
            })
        }
        const email2 = email.toLowerCase();

        const existUser = await userModel.find({ email: email2 });
        if (existUser.length > 0) {
            return res.status(200).send({
                success: false,
                message: "Email already exist "
            })
        }
        const salt = await bcrypt.genSalt(10);
        const newPassword = await bcrypt.hash(password, salt);
        // const compare = await bcrypt.compare(password, newPassword)
        const newUser = new userModel({ name, email: email2, phone, password: newPassword });
        await newUser.save()
        res.status(201).send({
            success: true,
            message: "registered successfully    ",
            newUser
        })
    } catch (error) {
        console.log('error', error)
        res.status(400).send({
            success: false,
            message: "something went wrong while resistering",
            error
        })
    }
}


