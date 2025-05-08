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

export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);
    // ? Check if req exists
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }
    // ? Verify the current user is the recipient
    if (friendRequest.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to accept this request" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    // ? Add the sender to the recipient's friends list
    // ** Note: $addToSet adds the specified value to an array only if it does not already exist
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });
    // ? Add the recipient to the sender's friends list
    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    res.status(200).json(friendRequest);
    
  } catch (error) {
    console.error("Error in acceptFriendRequest controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export async function getFriendRequests(req, res) {
  try {
    const incomingReqs = await FriendRequest.find({
      recipient: req.user.id,  
      status: "pending",
    }).populate("sender", "fullName, profilePic, nativeLanguage, learningLanguage");

    const acceptedReqs = await FriendRequest.find({
      sender: req.user.id, 
      status: "accepted",
    }).populate("recipient", "fullName, profilePic");

    res.status(200).json({ incomingReqs, acceptedReqs });
    
  } catch (error) {
    console.error("Error in getFriendRequests controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export async function getOutgoingFriendRequests(req, res) {
  try {
    const outgoingReqs = await FriendRequest.find({
      send: req.user.id,
      status: "pending",
    }).populate("recipient", "fullName, profilePic, nativeLanguage, learningLanguage");

    res.status(200).json(outgoingReqs);
    
  } catch (error) {
    console.error("Error in getOutgoingFriendRequests controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};