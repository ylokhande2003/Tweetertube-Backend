import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    //TODO: create playlist
    const playlist = await Playlist.create({
        name,
        description,
        userId: req.user._id
    })

    res.json(new ApiResponse(true, "Playlist created successfully", playlist))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists
    const playlists = await Playlist.find({ userId }).populate("videos").exec()

    return new ApiResponse(true, "Playlists fetched successfully", playlists).send(res)
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id
    const playlist = await Playlist.findById(playlistId).populate("videos").exec()

    if (!playlist) {
        return new ApiResponse(false, "Playlist not found", null).send(res)
    }

    return new ApiResponse(true, "Playlist fetched successfully", playlist).send(res)
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        return new ApiResponse(false, "Playlist not found", null).send(res)
    }

    const video = playlist.videos.find(vid => vid.toString() === videoId)

    if (video) {
        return new ApiResponse(false, "Video already in playlist", null).send(res)
    }

    playlist.videos.push(videoId)
    await playlist.save()

    return new ApiResponse(true, "Video added to playlist successfully", null).send(res)
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist
    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        return new ApiResponse(false, "Playlist not found", null).send(res)
    }

    const videoIndex = playlist.videos.indexOf(videoId)

    if (videoIndex === -1) {
        return new ApiResponse(false, "Video not in playlist", null).send(res)
    }

    playlist.videos.splice(videoIndex, 1)
    await playlist.save()

    return new ApiResponse(true, "Video removed from playlist successfully", null).send(res)
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist
    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        return new ApiResponse(false, "Playlist not found", null).send(res)
    }

    await playlist.remove()

    return new ApiResponse(true, "Playlist deleted successfully", null).send(res)
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist
    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        return new ApiResponse(false, "Playlist not found", null).send(res)
    }

    playlist.name = name
    playlist.description = description
    await playlist.save()

    return new ApiResponse(true, "Playlist updated successfully", playlist).send(res)
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
