import mongoose from 'mongoose';
import Product from '../models/product.model.js';
import { getProductImageUrl } from '../services/productImageService.js';

const ALLOWED_PRODUCT_CATEGORIES = ['vegetables', 'fruits', 'grains', 'dairy', 'meat', 'other'];
const ALLOWED_UNITS = ['kg', 'lb', 'piece', 'dozen', 'bundle'];

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const normalizeCategory = (category = '') => String(category || '').trim().toLowerCase();
const normalizeUnit = (unit = '') => String(unit || '').trim().toLowerCase();
const sanitizeOptionalImage = (image) => typeof image === 'string' && image.trim() ? image.trim() : '';

// Get all available products
export const getAllProducts = async (req, res) => {
    const { category } = req.query;
    
    console.log(`[products] getAllProducts called - category: ${category || 'all'}`);
    
    try {
        let query = { isAvailable: true, isInMarketplace: true };
        
        // Add category filter if provided
        if (category && category !== 'all') {
            query.category = category;
        }
        
        const products = await Product.find(query)
            .populate('farmer', 'name')
            .populate('farm', 'name');
        
        console.log(`[products] Found ${products.length} products`);
        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('[products] Error fetching products:', error);
        res.status(500).json({ success: false, msg: 'Internal Server Error' });
    }
};

// Get marketplace products (only products available in marketplace)
export const getMarketplaceProducts = async (req, res) => {
    const { category, organic, delivery } = req.query;
    
    console.log(`[products] getMarketplaceProducts called - filters:`, { category, organic, delivery });
    
    try {
        let query = { 
            isInMarketplace: true
        };
        
        // Add category filter if provided
        if (category && category !== 'all') {
            query.category = category;
        }
        
        // Add organic filter if provided
        if (organic === 'true') {
            query.isOrganic = true;
        }
        
        // Add delivery filter if provided
        if (delivery === 'true') {
            query.deliveryAvailable = true;
        }
        
        const products = await Product.find(query)
            .populate('farmer', 'name')
            .populate('farm', 'name location');
        
        console.log(`[products] Found ${products.length} marketplace products`);
        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('[products] Error fetching marketplace products:', error);
        res.status(500).json({ success: false, msg: 'Internal Server Error' });
    }
};

// Get products by category
export const getProductsByCategory = async (req, res) => {
    const { category } = req.params;
    
    try {
        const products = await Product.find({ 
            category: category,
            isAvailable: true,
            isInMarketplace: true
        })
        .populate('farmer', 'name')
        .populate('farm', 'name');
        
        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({ success: false, msg: 'Internal Server Error' });
    }
};

// Get single product
export const getProductById = async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ success: false, msg: 'Invalid product ID' });
    }
    
    try {
        const product = await Product.findById(id)
            .populate('farmer', 'name email phone')
            .populate('farm', 'name location');
        
        if (!product) {
            return res.status(404).json({ success: false, msg: 'Product not found' });
        }
        
        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ success: false, msg: 'Internal Server Error' });
    }
};

// Create new product (for farmers)
export const createProduct = async (req, res) => {
    const productData = req.body;

    if (req.user.role !== 'farmer' && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, msg: 'Only farmers can create products' });
    }

    const name = String(productData.name || '').trim();
    const description = String(productData.description || '').trim();
    const price = Number(productData.price);
    const category = normalizeCategory(productData.category);
    const unit = normalizeUnit(productData.unit);
    const stock = Number(productData.stock);

    if (!name || !description || !Number.isFinite(price) || !category || !unit) {
        return res.status(400).json({ success: false, msg: 'Missing required product fields.' });
    }

    if (name.length > 120) {
        return res.status(400).json({ success: false, msg: 'Product name must be 120 characters or less.' });
    }

    if (description.length > 2000) {
        return res.status(400).json({ success: false, msg: 'Product description must be 2000 characters or less.' });
    }

    if (price < 0 || Number.isNaN(price)) {
        return res.status(400).json({ success: false, msg: 'Product price must be a valid non-negative number.' });
    }

    if (!ALLOWED_PRODUCT_CATEGORIES.includes(category)) {
        return res.status(400).json({ success: false, msg: `Invalid category. Allowed: ${ALLOWED_PRODUCT_CATEGORIES.join(', ')}` });
    }

    if (!ALLOWED_UNITS.includes(unit)) {
        return res.status(400).json({ success: false, msg: `Invalid unit. Allowed: ${ALLOWED_UNITS.join(', ')}` });
    }

    if (stock < 0 || Number.isNaN(stock)) {
        return res.status(400).json({ success: false, msg: 'Stock must be a valid non-negative number.' });
    }

    // Auto-assign product image if none provided
    let imageUrl = sanitizeOptionalImage(productData.image);
    if (!imageUrl) {
        imageUrl = getProductImageUrl(name, category);
    }

    const safeProduct = {
        ...productData,
        name,
        description,
        price,
        category,
        unit,
        stock,
        image: imageUrl,
        farmer: req.user._id,
    };

    try {
        const newProduct = new Product(safeProduct);
        await newProduct.save();

        res.status(201).json({
            success: true,
            msg: 'Product created successfully',
            data: newProduct
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ success: false, msg: 'Internal Server Error' });
    }
};

// Create harvested product (from current crops)
export const createHarvestedProduct = async (req, res) => {
    const productData = req.body || {};
    const name = String(productData.name || '').trim();
    const description = String(productData.description || '').trim();
    const price = Number(productData.price ?? 0);
    const stock = Number(productData.stock ?? productData.harvestQuantity ?? 0);
    const category = normalizeCategory(productData.category || 'vegetables');
    const unit = normalizeUnit(productData.unit || 'kg');

    if (!name || !description || !Number.isFinite(price) || price < 0 || !Number.isFinite(stock) || stock < 0) {
        return res.status(400).json({ success: false, msg: 'Invalid harvested product data.' });
    }

    try {
        const image = sanitizeOptionalImage(productData.image) || getProductImageUrl(name, category);
        // Set default values for harvested products and force ownership to the authenticated farmer.
        const harvestedProduct = new Product({
            ...productData,
            name,
            description,
            price,
            stock,
            harvestQuantity: stock,
            category,
            unit,
            image,
            farmer: req.user._id,
            status: 'harvested',
            harvestDate: new Date(),
            isAvailable: false,
            isInMarketplace: false
        });
        
        await harvestedProduct.save();
        
        res.status(201).json({
            success: true,
            msg: 'Harvested product created successfully',
            data: harvestedProduct
        });
    } catch (error) {
        console.error('Error creating harvested product:', error);
        res.status(500).json({ success: false, msg: 'Internal Server Error' });
    }
};

// Add product to marketplace
export const addToMarketplace = async (req, res) => {
    const { id } = req.params;
    const marketplaceData = req.body;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ success: false, msg: 'Invalid product ID' });
    }
    
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, msg: 'Product not found' });
        }

        if (product.farmer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, msg: 'Not authorized to update this product.' });
        }

        const publishPrice = Number(marketplaceData.price ?? marketplaceData.marketplacePrice ?? product.price);
        if (!Number.isFinite(publishPrice) || publishPrice <= 0) {
            return res.status(400).json({ success: false, msg: 'Please set a valid positive price before publishing.' });
        }
        if (product.stock <= 0) {
            return res.status(400).json({ success: false, msg: 'Please add stock before publishing.' });
        }
        const image = sanitizeOptionalImage(marketplaceData.image || marketplaceData.marketplaceImage || product.image) || getProductImageUrl(product.name, product.category);

        const updatedProduct = await Product.findByIdAndUpdate(id, {
            ...marketplaceData,
            price: publishPrice,
            image,
            marketplaceImage: image,
            isInMarketplace: true,
            status: 'in_marketplace',
            isAvailable: true,
            farmer: product.farmer
        }, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            msg: 'Product removed from marketplace successfully',
            data: updatedProduct
        });
    } catch (error) {
        console.error('Error adding product to marketplace:', error);
        res.status(500).json({ success: false, msg: 'Internal Server Error' });
    }
};

// Remove product from marketplace
export const removeFromMarketplace = async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ success: false, msg: 'Invalid product ID' });
    }
    
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, msg: 'Product not found' });
        }

        if (product.farmer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, msg: 'Not authorized to update this product.' });
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, {
            isInMarketplace: false,
            status: 'harvested'
        }, {
            new: true,
            runValidators: true
        });

        if (!updatedProduct) {
            return res.status(404).json({ success: false, msg: 'Product not found' });
        }
        
        res.status(200).json({
            success: true,
            msg: 'Product removed from marketplace successfully',
            data: updatedProduct
        });
    } catch (error) {
        console.error('Error removing product from marketplace:', error);
        res.status(500).json({ success: false, msg: 'Internal Server Error' });
    }
};

// Update product
export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    if (!isValidObjectId(id)) {
        return res.status(400).json({ success: false, msg: 'Invalid product ID' });
    }
    
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, msg: 'Product not found' });
        }

        // H2: Only the product owner or admin can update
        if (product.farmer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, msg: 'Not authorized to update this product' });
        }
        
        delete updates.farmer;
        delete updates._id;
        if (updates.category !== undefined) updates.category = normalizeCategory(updates.category);
        if (updates.unit !== undefined) updates.unit = normalizeUnit(updates.unit);
        if (updates.price !== undefined) updates.price = Number(updates.price);
        if (updates.stock !== undefined) updates.stock = Number(updates.stock);
        if (!sanitizeOptionalImage(updates.image) && (updates.name || updates.category)) {
            updates.image = getProductImageUrl(updates.name || product.name, updates.category || product.category);
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });
        
        res.status(200).json({
            success: true,
            msg: 'Product updated successfully',
            data: updatedProduct
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ success: false, msg: 'Internal Server Error' });
    }
};

// Delete product
export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
        return res.status(400).json({ success: false, msg: 'Invalid product ID' });
    }
    
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, msg: 'Product not found' });
        }

        // H3: Only the product owner or admin can delete
        if (product.farmer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, msg: 'Not authorized to delete this product' });
        }
        
        await Product.findByIdAndDelete(id);
        
        res.status(200).json({
            success: true,
            msg: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ success: false, msg: 'Internal Server Error' });
    }
};

// Get products by farmer (for marketplace - only published products)
export const getProductsByFarmer = async (req, res) => {
    const { farmerId } = req.params;
    const { category, status } = req.query;
    if (!isValidObjectId(farmerId)) {
        return res.status(400).json({ success: false, msg: 'Invalid farmer ID' });
    }
    
    try {
        let query = { farmer: farmerId, isAvailable: true, isInMarketplace: true };
        
        // Add category filter if provided
        if (category && category !== 'all') {
            query.category = category;
        }
        
        // Add status filter if provided
        if (status && status !== 'all') {
            query.status = status;
        }
        
        const products = await Product.find(query)
            .populate('farm', 'name location');
        
        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Error fetching farmer products:', error);
        res.status(500).json({ success: false, msg: 'Internal Server Error' });
    }
};

// Get farmer's own products (including unpublished ones)
export const getFarmerOwnProducts = async (req, res) => {
    const { farmerId } = req.params;
    const { category } = req.query;

    if (!mongoose.Types.ObjectId.isValid(farmerId)) {
        return res.status(400).json({ success: false, msg: 'Invalid farmer ID.' });
    }

    if (req.user._id.toString() !== farmerId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, msg: 'Not authorized to view this content.' });
    }

    try {
        let query = {
            farmer: farmerId
        };

        if (category && category !== 'all') {
            query.category = category;
        }

        const products = await Product.find(query)
            .populate('farm', 'name location')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.error('Error fetching farmer own products:', error);
        res.status(500).json({ success: false, msg: 'Internal Server Error' });
    }
};

// Publish/unpublish product
export const toggleProductAvailability = async (req, res) => {
    const { id } = req.params;
    const { isAvailable } = req.body;
    
    if (!isValidObjectId(id)) {
        return res.status(400).json({ success: false, msg: 'Invalid product ID' });
    }
    
    try {
        const product = await Product.findById(id);
        
        if (!product) {
            return res.status(404).json({ success: false, msg: 'Product not found' });
        }

        // H4: Only the product owner or admin can toggle availability
        if (product.farmer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, msg: 'Not authorized to change this product\'s availability' });
        }
        
        const shouldPublish = Boolean(isAvailable);

        // Check if product has a price and stock before publishing
        if (shouldPublish && product.price <= 0) {
            return res.status(400).json({ 
                success: false, 
                msg: 'Please set a price before publishing the product' 
            });
        }

        if (shouldPublish && product.stock <= 0) {
            return res.status(400).json({
                success: false,
                msg: 'Please add stock before publishing the product'
            });
        }
        
        product.isAvailable = shouldPublish;
        product.isInMarketplace = shouldPublish;
        product.status = shouldPublish ? 'in_marketplace' : 'harvested';
        await product.save();
        
        res.status(200).json({
            success: true,
            msg: `Product ${isAvailable ? 'published' : 'unpublished'} successfully`,
            data: product
        });
    } catch (error) {
        console.error('Error toggling product availability:', error);
        res.status(500).json({ success: false, msg: 'Internal Server Error' });
    }
};

// Get harvested products by farmer (My Products section)
export const getHarvestedProductsByFarmer = async (req, res) => {
    const { farmerId } = req.params;
    if (!isValidObjectId(farmerId)) {
        return res.status(400).json({ success: false, msg: 'Invalid farmer ID' });
    }
    if (req.user._id.toString() !== farmerId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, msg: 'Not authorized to view this content.' });
    }
    
    try {
        const products = await Product.find({ 
            farmer: farmerId,
            status: 'harvested'
        })
        .populate('farm', 'name location');
        
        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Error fetching harvested products:', error);
        res.status(500).json({ success: false, msg: 'Internal Server Error' });
    }
};

// Get marketplace products by farmer
export const getMarketplaceProductsByFarmer = async (req, res) => {
    const { farmerId } = req.params;
    if (!isValidObjectId(farmerId)) {
        return res.status(400).json({ success: false, msg: 'Invalid farmer ID' });
    }
    if (req.user._id.toString() !== farmerId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, msg: 'Not authorized to view this content.' });
    }
    
    try {
        const products = await Product.find({ 
            farmer: farmerId,
            isInMarketplace: true,
            status: 'in_marketplace'
        })
        .populate('farm', 'name location');
        
        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Error fetching marketplace products:', error);
        res.status(500).json({ success: false, msg: 'Internal Server Error' });
    }
}; 