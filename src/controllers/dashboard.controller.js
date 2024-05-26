import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
const getChannelStats = asyncHandler(async (req, res) => {
    // Check if the channelId is a valid ObjectId
    const { channelId } = req.params; // Assuming channelId is passed as a route parameter
    
    try {
        // Get the total number of videos uploaded by the channel
        const totalVideos = await Video.countDocuments({ owner: channelId });
        console.log(totalVideos);

        // Get the total number of subscribers for the channel
        const totalSubscribers = await Subscription.countDocuments({ channel: channelId });
        console.log(totalSubscribers);

        // Get the total number of likes for the channel's videos
        const videoIds = await Video.find({ owner: channelId }).select("_id").then(docs => docs.map(doc => doc._id));
        console.log(videoIds);
        // Get the total number of likes for the channel's videos
        const totalLikes = await Like.countDocuments({ video:  videoIds  });
        console.log(totalLikes);
        // Get the total number of views for the channel's videos
      
        const channelStats = {
            totalVideos: totalVideos,
            totalSubscribers: totalSubscribers,
            totalLikes: totalLikes,
        };
        
        res.status(200).json(new ApiResponse(true, "Channel stats fetched successfully", channelStats));
    } catch (error) {
        console.log(error);
        res.status(400).json(new ApiError(error))
    }
})
// const getChannelVideos = asyncHandler(async (req, res) => {
//     // TODO: Get all the videos uploaded by the userid
//     try {
//         const owner = req.body.owner;
//         // Get all the videos uploaded by the channel
//         const videos = await Video.find({ owner })
//             .populate("owner", "username")
//             .sort({ createdAt: -1 });

//         if (videos.length) { res.status(200).json(new ApiResponse(true, "Channel videos fetched successfully", videos)); } else {
//             error
//         }

//     } catch (error) {
//         throw new ApiError(404, "error in getchannel video", error)
//     }

// })

export {
    getChannelStats,
    // getChannelVideos
}