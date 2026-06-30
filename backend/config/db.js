import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        // Validate MONGODB_URI exists
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined. Please set it in your environment variables.");
        }

        console.log('\n🔌 Connecting to MongoDB Atlas...');
        
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('✓ MongoDB Connected');
        console.log(`Database: ${conn.connection.name}`);
        console.log(`Host: ${conn.connection.host}\n`);
        
        return conn;
    } catch (error) {
        console.error('\n❌ MongoDB connection failed:');
        console.error(`   ${error.message}\n`);
        console.error('Server startup aborted.\n');
        process.exit(1);
    }
};
