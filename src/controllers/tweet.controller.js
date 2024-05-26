import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    try {
        const { content, _id } = req.body;

        // Check if the userId is a valid ObjectId
        if (!isValidObjectId(_id)) {
            throw new ApiError(400, "Invalid userId");
        }

        const user = await User.findById(_id);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const tweet = new Tweet({
            content,
            owner: user._id
        });

        await tweet.save();

        res.status(201).json(new ApiResponse(true, "Tweet created successfully", tweet));
    } catch (error) {
        console.log(error);
    }
})
const getTweets = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  
    const queryObject = {};
  
    if (query) {
      queryObject.$or = [{ title: { $regex: query, $options: 'i' } }, { description: { $regex: query, $options: 'i' } }];
    }
  
    if (userId) {
      queryObject.userId = userId;
    }
  
    const sortObject = {};
  
    if (sortBy && sortType) {
      sortObject[sortBy] = sortType === 'asc' ? 1 : -1;
    }
  
    const tweets = await Tweet.find(queryObject)
      .populate('owner')
      .sort(sortObject)
      .skip((page - 1) * limit)
      .limit(limit);
  
    const totalTweets = await Tweet.countDocuments(queryObject);
  
    res.status(200).json({
      success: true,
      data: tweets,
      pagination: {
        page,
        limit,
        totalTweets,
        totalPages: Math.ceil(totalTweets / limit),
      },
    });
  });
const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params;
    
    // Check if the userId is a valid ObjectId
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId");
    }
        
    const tweets = await Tweet.find({ owner: userId })
        .populate("owner")
        .sort({ createdAt: -1 });
       

    return res.status(200).json(new ApiResponse(true, "Tweets fetched successfully", tweets));
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params;
    const { content } = req.body;

    // Check if the tweetId is a valid ObjectId
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    tweet.content = content;
    await tweet.save();

    res.status(200).json(new ApiResponse(true, "Tweet updated successfully", tweet));
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params;

    // Check if the tweetId is a valid ObjectId
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    await tweet.deleteOne();

    res.status(200).json(new ApiResponse(true, "Tweet deleted successfully"));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    getTweets
}