import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  bio: {
    type: String,
    default: "",
  },
  profilePic: {
    type: String,
    default: "",
  },
  nativeLanguage: {
    type: String,
    default: "",
  },
  learningLanguage: {
    type: String,
    default: "",
  },
  location: {
    type: String,
    default: "",
  },
  isOnBoarded: {
    type: Boolean,
    default: false,
  },
  //* Array of ObjectIds of friends
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  ]

}, { timestamps: true });


//* Pre Hook to hash password before saving to database
userSchema.pre("save", async function (next) {

  if(!this.isModified("password")) return next();   //* If password is not modified, skip hashing.
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();
  } catch (error) {
    console.error("Error in pre save hook: ", error);
    next(error);
  }
});

const User = mongoose.model("User", userSchema);
export default User;