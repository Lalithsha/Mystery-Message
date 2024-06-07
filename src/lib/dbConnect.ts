import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number
}

const connection: ConnectionObject = {
    
}

async function dbConnect(): Promise<void>{
    if(connection.isConnected){
        console.log("Already connected to database");
        return
    }

    try {
        const db= await mongoose.connect(process.env.MONGODB_URI || '',{})
        console.log(db," This is the database");
        connection.isConnected =  db.connections[0].readyState;
        console.log(db.connection," This is the database[0]");
        console.log("DB Connected Successfully");
        
    } catch (error) {
        console.log("Database connection failed: ", error);
        
        process.exit()
    }
    
}

export default dbConnect;
