import Farm from "../models/farm.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

export const getFarms = async (req, res) => {
    console.log('[farms] getFarms called');
    
    try {
        const farms = await Farm.find({}).populate('farmer', 'name email');
        console.log(`[farms] Found ${farms.length} farms`);
        res.status(200).json({success: true, data: farms});
    } catch (err) {
        console.error('[farms] Error fetching farms:', err.message);
        res.status(500).json({success: false, message: "Server error"});
    }
}

export const getFarmById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid farm ID' });
        }

        const farm = await Farm.findById(id).populate('farmer', 'name email');
        if (!farm) {
            return res.status(404).json({ success: false, message: 'Farm not found' });
        }
        res.status(200).json({success: true, data: farm});
    } catch (err) {
        console.log("error in fetching farm", err.message);
        res.status(500).json({success: false, message: "Server error"});
    }
}

export const getFarmsByFarmer = async (req, res) => {
    try {
        const { farmerId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(farmerId)) {
            return res.status(400).json({ success: false, message: 'Invalid farmer ID' });
        }

        // IDOR guard: farmers can only view their own farms; admins can view any
        if (req.user.role !== 'admin' && req.user._id.toString() !== farmerId) {
            return res.status(403).json({ success: false, message: 'Not authorized to view these farms' });
        }

        const farms = await Farm.find({ farmer: farmerId }).populate('farmer', 'name email');
        res.status(200).json({success: true, data: farms});
    } catch (err) {
        console.log("error in fetching farms by farmer", err.message);
        res.status(500).json({success: false, message: "Server error"});
    }
}

export const addFarm = async (req, res) => {
    const farmData = req.body;

    const name = String(farmData.name || '').trim();
    const location = String(farmData.location || '').trim();
    const soilType = String(farmData.soilType || '').trim();
    const landSize = String(farmData.landSize || '').trim();
    const mapView = String(farmData.mapView || '').trim();
    const description = String(farmData.description || '').trim();
    const establishedYear = farmData.establishedYear ? Number(farmData.establishedYear) : undefined;

    if (!name || !location || !soilType || !landSize || !mapView) {
        return res.status(400).json({ success: false, message: 'Please provide name, location, soil type, land size, and map view.' });
    }

    if (name.length > 120 || location.length > 120 || soilType.length > 80 || landSize.length > 40) {
        return res.status(400).json({ success: false, message: 'One or more farm fields exceed allowed length.' });
    }

    if (establishedYear && (Number.isNaN(establishedYear) || establishedYear < 1800 || establishedYear > new Date().getFullYear())) {
        return res.status(400).json({ success: false, message: 'Established year is invalid.' });
    }

    const safeFarm = {
        name,
        location,
        soilType,
        landSize,
        mapView,
        description,
        establishedYear,
        farmer: req.user._id
    };

    const newFarm = new Farm(safeFarm);

    try {
        await newFarm.save();

        await User.findByIdAndUpdate(req.user._id, { $push: { farms: newFarm._id } });

        const populatedFarm = await Farm.findById(newFarm._id).populate('farmer', 'name email');
        res.status(201).json({ success: true, data: populatedFarm });
    } catch (err) {
        console.error('Error creating farm', err.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

export const deleteFarm = async (req, res) => {
    const {id} = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({success: false, message: 'Farm not found'});
    }

    try {
        // Get the farm first to find the farmer
        const farm = await Farm.findById(id);
        if (!farm) {
            return res.status(404).json({success: false, message: 'Farm not found'});
        }

        // IDOR guard: only the farm owner or an admin can delete
        const isOwner = farm.farmer.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({success: false, message: 'Not authorized to delete this farm'});
        }
        
        // Delete the farm
        await Farm.findByIdAndDelete(id);
        
        // Remove the farm from the user's farms array
        await User.findByIdAndUpdate(
            farm.farmer,
            { $pull: { farms: id } }
        );
        
        res.status(200).json({success: true, message: 'Farm deleted successfully'});
    } catch (error) {
        console.error("Error deleting farm", error.message);
        res.status(500).json({success: false, message: 'Server error'});
    }
}

export const updateFarm = async (req, res) => {
    const { id } = req.params;
    const farmData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: 'Farm not found' });
    }

    const allowedUpdates = ['name', 'location', 'soilType', 'landSize', 'mapView', 'description', 'establishedYear'];
    const safeUpdates = {};
    allowedUpdates.forEach((field) => {
        if (field in farmData) {
            safeUpdates[field] = farmData[field];
        }
    });

    if (safeUpdates.name && String(safeUpdates.name).trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Farm name cannot be empty.' });
    }

    try {
        const farm = await Farm.findById(id);
        if (!farm) {
            return res.status(404).json({ success: false, message: 'Farm not found' });
        }

        const isOwner = farm.farmer.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this farm' });
        }

        const updatedFarm = await Farm.findByIdAndUpdate(id, safeUpdates, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: updatedFarm });
    } catch (error) {
        console.error('Error updating farm', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}