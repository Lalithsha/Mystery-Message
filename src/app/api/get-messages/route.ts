import { getServerSession } from "next-auth"; // getting current user session - can get user-> then id 
import { authOptions } from "../auth/[...nextauth]/option"; // credentials provider
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { User } from "next-auth";
import mongoose from "mongoose";


export async function GET(request:Request){

    await dbConnect();

    const session =  await getServerSession(authOptions)
    const user:User = session?.user as User
    if (!session || !session.user) {
        return Response.json(
            {
                success: false,
                message:"Not Authenticated"
            }, {status: 401}
        )
    }
    
    const userId =  new mongoose.Types.ObjectId(user._id);
    try {
        
        const user = await UserModel.aggregate([ // Aggregation pipeline
            { $match: {id: userId} }, // match bahut sare users hai usme se woh user la ke do jiki id match ho.
            {$unwind: '$messages'}, // arrays unwind karo 
            {$sort: {'messages.createdAt': -1}},
            // After sorting. documents are not arranged (bikhre hue hai)
            // Now grouping documents to keep then arranged as we have sorted them
            {$group:{_id: '$id', messages:{$push: "messages"}}}

        ])
        
        if(!user|| user.length===0){
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                {status: 401}
            )
        }
        
        return Response.json(
            {
                success: true,
                messages: user[0].messages
            },
            {status: 200}
        )

        
    } catch (error) {
        console.log("An unexpected error occurred ", error);
        
        return Response.json(
            {
                success: false,
                message: "Not authenticated"   
            },
            {status: 500}
        )
    }

    
}

























