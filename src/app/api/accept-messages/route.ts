import { getServerSession } from "next-auth"; // getting current user session - can get user-> then id 
import { authOptions } from "../auth/[...nextauth]/option"; // credentials provider
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { User } from "next-auth";


export async function POST(request: Request){

    await dbConnect();
    
    const session =  await getServerSession(authOptions)
    const user:User = session?.user as User // how we are getting the user using session -> go to [..nextauth]'s options and 
                               // you can see ther we have passed user to the session. Hence we need that here so we extracting it & using it
    
    // checking session is there or not and also checking user is there or not. if any of one is missing
    // then we know user is not logged in

    if (!session || !session.user) {
        return Response.json(
            {
                success: false,
                message:"Not Authenticated"
            }, {status: 401}
        )
    }
    
    const userId =  user._id
    const {acceptMessages} =  await request.json()

    try {
        
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {isAcceptingMessage: acceptMessages},
            {new:true} // using this line of code we are getting the new updated value
        )
        
        if (!updatedUser) {
            return Response.json(
                {
                    success: false,
                    message:"Failed to update user status to accept messages"
                }, {status: 401}
            )
        }

        return Response.json(
            {
                success: true,
                message:"Message acceptance status updated successfully",
                updatedUser
            }, {status: 200}
        )
        
    } catch (error) {
        console.log("Failed to update user status to accept messages",error);
        return Response.json(
            {
                success: false,
                message:"Failed to update user status to accept messages"
            }, {status: 500}
        )
    }
    
}


export async function GET(request: Request){
    
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
    
    const userId =  user._id

    try {
        const foundUser =  await UserModel.findById(userId)
    
        if(!foundUser){
            return Response.json(
                {
                    success: false,
                    message:"User not found"
                }, {status: 404}
            )
        }
        
        return Response.json(
            {
                success: true,
                message:"User found",
                isAcceptingMessage: foundUser.isAcceptingMessage
            }, {status: 200}
        )
    } catch (error) {
        console.log("Failed to update user status to accept messages", error);
        return Response.json(
            {
                success: false,
                message:"Error in getting message acceptance status"
            }, {status: 500}
        )
    }
}



