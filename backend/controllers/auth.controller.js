import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookie.js";
import generateVerificationToken from "../utils/generateVerificationToken.js";
import { sendVerificationEmail } from "../mailtrap/email.js";
import { User } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import mongoose from "mongoose";

export const register = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    const { email, password, name } = req.body;

    if ([email, password, name]?.some((field) => !field))
      throw new Error("All fields are required");

    const userAlreadyExists = await User.findOne({
      email,
    });

    if (userAlreadyExists)
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const verificationToken = generateVerificationToken();
    const verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      verificationTokenExpiresAt,
    });
    generateTokenAndSetCookie({
      userID: newUser?._id,
      res,
    });

    await sendVerificationEmail({
      email: newUser.email,
      verificationToken,
      verificationTokenExpiresAt,
    });

    await session.commitTransaction();
    res.status(201).send({
      success: true,
      message: "User created successfully",
      user: {
        ...newUser._doc,
        password: undefined,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).send({
      status: false,
      message: error.message,
    });
  } finally {
    session.endSession();
  }
};

export const login = async (req, res) => {
  res.send("Login routes");
};

export const logout = async (req, res) => {
  res.send("Logout routes");
};

export const verifyEmail = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).send({
        status: false,
        message: "Invalid or Expired verification code",
      });

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    user.save();

    await sendWelcomeEmail({
      email: user.email,
      name: user.name,
    });

    return res.status(200).send({
      status: true,
      message: "Verify email successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};
