import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    try {
        const { videoId } = req.params
        const { page = 1, limit = 10 } = req.query
        console.log(videoId);
        const videoComments = await Comment.find({ video: videoId })
            .populate("owner")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        console.log(videoComments.length);

        if (!videoComments.length) {
            throw new ApiError(400, "No comments found for this video");
        }

        res.status(200).json(new ApiResponse(true, "Comments fetched successfully", videoComments));
    } catch (error) {
        return new ApiError(`No comments found for this video ${error}`, 500);
    }

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params;
    const { content } = req.body;
    const user = req.user;

    const newComment = await Comment.create({
        content,
        video: videoId,
        owner: user._id
    });

    return res.status(201).json(new ApiResponse(true, "Comment added successfully", newComment));
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    try {
        const { commentId } = req.params;
        const { content } = req.body;

        const updatedComment = await Comment.findByIdAndUpdate(commentId, { content }, { new: true });

        if (!updatedComment) {
            return next(new ApiError("Comment not found", 404));
        }

        return res.status(200).json(new ApiResponse(true, "Comment updated successfully", updatedComment));
    } catch (error) {
        return console.log(error);
    }
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;
    console.log(commentId);

    await Comment.findByIdAndDelete(commentId);

    return res.status(200).json(new ApiResponse(true, "Comment deleted successfully"));
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}