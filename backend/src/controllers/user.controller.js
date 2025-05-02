import FriendRequest from "../models/FriendRequest.model.js";
import User from "../models/User.model.js";

export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user.id;
    const currentUser = req.user;

    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } },  // exclude current user
        { $id: { $nin: currentUser.friends } },  // exclude current user's friend
        { isOnBoarded: true },  // only include onboarded users
      ]
    });

    res.status(200).json(recommendedUsers);

  } catch (error) {
    console.error("Error in getRecommendedUsers controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select("friends")  // select only friends field
      .populate("friends", "fullName, profilePic, nativeLanguage, learningLanguage"); // populate with user details

    res.status(200).json(user.friends);

  } catch (error) {
    console.error("Error in getMyFriends controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;

    //? Prevent self-friendship
    if (myId === recipientId) {
      return res.status(400).json({ message: "You cannot send a friend request to yourself" });
    }

    //? Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(400).json({ message: "Recipient not found" })
    }

    // ?Check if user is already friend
    if (recipient.friends.includes(myId)) {
      return res.status(400).json({ message: "You are already friends with this user" });
    }

    // ?Check if req already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });
    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    // ?Create new friend request
    const friendRequest = new FriendRequest({
      sender: myId,
      recipient: recipientId,
    });

    await friendRequest.save();

    res.status(201).json(friendRequest);

  } catch (error) {
    console.error("Error in sendFriendRequest controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};