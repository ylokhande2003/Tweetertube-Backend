import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"



const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    const queryObject = {}

    if (query) {
        queryObject.$or = [{ title: { $regex: query, $options: 'i' } }, { description: { $regex: query, $options: 'i' } }]
    }

    if (userId) {
        queryObject.userId = userId
    }

    const sortObject = {}

    if (sortBy && sortType) {
        sortObject[sortBy] = sortType === 'asc' ? 1 : -1
    }
     const videos = await Video.aggregate([
        { $match: queryObject },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
       
        // { $sort: sortObject },
        { $skip: (page - 1) * limit },
        { $limit: limit }
    ]);

    // const videos = await Video.find(queryObject).sort(sortObject).skip((page - 1) * limit).limit(limit)
    const totalVideos = await Video.countDocuments(queryObject)

    res.status(200).json({
        success: true,
        data: videos,
        pagination: {
            page,
            limit,
            totalVideos,
            totalPages: Math.ceil(totalVideos / limit),
        },
    })
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, duration, userId } = req.body
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "thumbnail file is required")
    }

    // TODO: get video, upload to cloudinary, create video
    const videoLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    if (!videoLocalPath) {
        throw new ApiError(400, "video file is required")
    }
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnail file is required")
    }
    const videoFile = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if (!videoFile) {
        throw new ApiError(400, "video file is required")
    }
    if (!thumbnail) {
        throw new ApiError(400, "thumbnail file is required")
    }

    const user = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration,
        owner: userId
    })
    const createdUser = await Video.findById(user._id).select(
        "-refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while uplod the video")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "video uplod Successfully")
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;

        console.log(userId);
        const video = await Video.find({owner:userId})
console.log(video);
        if (!video) {
            throw new ApiError(404, 'Video not found')
        }

        res.status(200).json(
            new ApiResponse(200, video, 'Video fetched Successfully')
        )
    } catch (error) {
        throw new ApiError(400, error, "video")
    }
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    try {
      const { videoId } = req.params;
      const { title, description } = req.body;
  
      const video = await Video.findById(videoId);
  
      if (!video) {
        throw new ApiError(404, 'Video not found');
      }

        const thumbnailLocalPath = req.file.path;
        console.log(thumbnailLocalPath);
        if (!thumbnailLocalPath) {
          throw new ApiError(400, 'thumbnail file is required');
        }
  
        const thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath);
        console.log(thumbnailFile);
  
        if (!thumbnailFile) {
          throw new ApiError(400, 'thumbnail file is required');
        }
  
        video.thumbnail = thumbnailFile.url;
      
  
      video.title = title || video.title;
      video.description = description || video.description;
  
      await video.save();
  
      res.status(200).json(new ApiResponse(200, video, 'Video updated Successfully'));
    } catch (error) {
      console.error(error);
      if (error.name === 'ApiError') {
        res.status(error.statusCode).json(new ApiResponse(error.statusCode, {}, error.message));
      } else {
        res.status(500).json(new ApiResponse(500, {}, 'Internal Server Error'));
      }
    }
  });

const deleteVideo = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;
        const video = await Video.deleteOne({ _id: videoId })

        // if (!video) {
        //     throw new ApiError(404, 'Video not found')
        // }

        // await video.Remove()

        res.status(200).json(
            new ApiResponse(200, null, 'Video deleted Successfully')
        )
    } catch (error) {
        throw new ApiError(400, error)
    }
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params
        const video = await Video.findById(videoId)

        if (!video) {
            throw new ApiError(404, 'Video not found')
        }

        video.isPublished = !video.isPublished

        await video.save()

        res.status(200).json(
            new ApiResponse(200, video, 'Video published status toggled Successfully')
        )
    } catch (error) {
        res.status(400).json(
            new ApiResponse(400, 'Video published status toggled Successfully', error)
        )
    }
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
