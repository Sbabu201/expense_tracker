const questionModel = require("../models/questionModel")
const otpGenerator = require("otp-generator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const otpModel = require("../models/otpModel")

const nodemailer = require('nodemailer');


exports.questionByIdController = async (req, res) => {
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
exports.editQuestionController = async (req, res) => {
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
exports.getAllQuestionController = async (req, res) => {
    try {

        // const { exam } = req.body;
        // if (!exam) {
        //     return res.status(401).send({
        //         success: false,
        //         message: "Please select an exam type...",
        //     })
        // }

        const filteredQuestions = await questionModel.find();
        const Questions = filteredQuestions?.map((item) => ({
            title: item.title,
            options: item.options.map((option) => ({
                value: option.value,
            })),
        }));
        {
            return res.status(201).send({
                success: true,
                message: "all questions got successfully   ",
                Questions
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

exports.deleteQuestionController = async (req, res) => {
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
exports.questionCreateController = async (req, res) => {
    try {
        const { exam, title, options } = req.body;
        if (!exam || !title || !options) {
            return res.status(400).send({
                success: false,
                message: "enter valid document to continue"
            })
        }
        if (!Array.isArray(options) || options.length !== 4) {
            return res.status(400).json({ error: "Expected 4 options" });
        }

        const trueCount = options.filter((opt) => opt.isTrue).length;

        if (trueCount !== 1) {
            return res.status(400).json({ error: "There must be exactly one correct answer" });
        }

        const newQuestion = new questionModel({ exam, title, options });
        await newQuestion.save()
        res.status(201).send({
            success: true,
            message: "Question created successfully   ",
            newQuestion
        })
    } catch (error) {
        console.log('error', error)
        res.status(400).send({
            success: false,
            message: "something went wrong while creating the question",
            error
        })
    }
}


