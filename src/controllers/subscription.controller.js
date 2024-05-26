import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    // TODO: toggle subscription
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId");
    }

    // Check if the user is already subscribed to the channel
    const subscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId,
    });
    // console.log(subscription);

    if (subscription) {
        // If the user is already subscribed, unsubscribe them
        await Subscription.deleteOne({ _id: subscription._id });
        res.status(200).json(new ApiResponse(true, "Unsubscribed successfully"));
    } else {
        // If the user is not subscribed, subscribe them
        // console.log(channelId, req.user._id);
        await new Subscription({
            subscriber: req.user._id,
            channel: channelId,
        }).save();
        res.status(200).json(new ApiResponse(true, "Subscribed successfully"));
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    console.log(subscriberId);
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriberId");
    }

    // Get all channels to which the user has subscribed
    const subscribedChannels = await Subscription.find({ subscriber: subscriberId })
        .populate("channel")
        .sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(true, "Subscribed channels fetched successfully", subscribedChannels));

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId");
    }

    // Get all subscribers for the channel
    const subscribers = await Subscription.find({ channel: channelId })
        .populate("subscriber")
        .sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(true, "Subscribers fetched successfully", subscribers));
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}