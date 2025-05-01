import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.model.js";
import jwt from "jsonwebtoken";

export async function signup(req, res) {
  const { email, password, fullName } = req.body;

  try {
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check existing User
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists, please choose another one" });
    }

    // Randomly generate a profile picture URL
    const idx = Math.floor(Math.random() * 100) + 1; // Generate a random number between 1 and 100
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    // Create new User
    const newUser = await User.create({
      email,
      password,
      fullName,
      profilePic: randomAvatar,
    });

    //? Create User in Stream.
    try {
      await upsertStreamUser({
        id: newUser._id,
        name: newUser.fullName,
        image: newUser.profilePic || "",
      });
      console.log(`Stream user created for ${newUser.fullName}`);
    } catch (error) {
      console.error("Error in creating Stream user: ", error);
    }

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    // Send JWT token in response
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,  // Prevent client-side JavaScript from accessing the cookie, which helps protect against XSS (Cross-Site Scripting) attacks.
      sameSite: "strict", // Prevent CSRF attacks
      secure: process.env.NODE_ENV === "production", // Only send cookie over HTTPS
    });

    res.status(201).json({ success: true, user: newUser, message: "User created successfully" });

  } catch (error) {
    console.error("Error in signup controller: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check credentials
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) return res.status(401).json({ message: "Invalid email or password" });

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    // Send JWT token in response
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,  // Prevent client-side JavaScript from accessing the cookie, which helps protect against XSS (Cross-Site Scripting) attacks.
      sameSite: "strict", // Prevent CSRF attacks
      secure: process.env.NODE_ENV === "production", // Only send cookie over HTTPS
    });

    res.status(200).json({ success: true, user, message: "User logged in successfully" });

  } catch (error) {
    console.error("Error in login controller: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export function logout(req, res) {
  res.clearCookie("jwt");
  res.status(200).json({success: true, message: "Logout successful"});
};