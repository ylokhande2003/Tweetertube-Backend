import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
const countVideoLike = asyncHandler(async(req,res)=>{
    
    try {
        const {videoId} = req.params
        console.log(videoId);
        const count = await Like.countDocuments({video:videoId})
        // console.log(count);
        res.status(200).json(new ApiResponse(true,"get the like cout", count))
        
    } catch (error) {
        console.log(error);
    }
})
const countCommentLike = asyncHandler(async(req,res)=>{
    
    try {
        const {commentId} = req.params
        // console.log(commentId);
        const count = await Like.countDocuments({comment:commentId})
        // console.log(count);
        res.status(200).json(new ApiResponse(true,"get the like cout", count))
        
    } catch (error) {
        res.status(400).json(new ApiError("count error",error))
    }
})

const countTweetLike = asyncHandler(async(req,res)=>{
    
    try {
        const {tweetId} = req.params
        // console.log(tweetId);
        const count = await Like.countDocuments({tweet:tweetId})
        // console.log(count);
        res.status(200).json(new ApiResponse(true,"get the like cout", count))
        
    } catch (error) {
        res.status(400).json(new ApiError("count error",error))
    }
})
const toggleVideoLike = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params
        //TODO: toggle like on video
        const userId = req.user._id


        const like = await Like.findOne({ likedBy: userId, video: videoId })


        if (like) {
            await Like.deleteOne({ _id: like._id })
            res.status(200).json(new ApiResponse(true, "Like removed successfully"))
        } else {
            const newLike = await Like.create({ video: videoId, likedBy: userId })
            res.status(200).json(new ApiResponse(true, "Like added successfully"))

        }
    } catch (error) {
        res.json(new ApiError(500, error))
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
   try {
     const { commentId } = req.params
     //TODO: toggle like on comment
     const userId = req.user._id
     // console.log(userId);
     // console.log(commentId);
 
     const like = await Like.findOne({ likedBy: userId, comment: commentId })
     
     if (like) {
         await Like.deleteOne({ _id: like._id })
         res.status(200).json( new ApiResponse(true, "Like removed successfully"));
     } else {
         const newLike = await Like.create({ likedBy:userId, comment:commentId })
         res.status(200).json( new ApiResponse(true, "Like added successfully"));
     }
   } catch (error) {
    res.json(new ApiError(500, error))
   }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet
    const userId = req.user._id
    

    const like = await Like.findOne({ likedBy: userId, tweet: tweetId })

    if (like) {
        await Like.deleteOne({ _id: like._id })
        res.status(200).json( new ApiResponse(true, "Like removed successfully"));
    } else {
        const newLike = await Like.create({ likedBy: userId, tweet: tweetId })
        res.status(200).json( new ApiResponse(true, "Like added successfully"));
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    try {
        const userId = req.user._id
        const likedVideos = await Like.find({
            likedBy: userId,
            $or: [{ video: { $ne: null } }]
          }).populate("video") 
        res.status(200).json( new ApiResponse(true, "Liked videos fetched successfully", likedVideos));
    } catch (error) {
        throw new ApiError(500, "error in get liked videos ", error)
    }
})

export {

    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
    countVideoLike,
    countTweetLike,
    countCommentLike
}