import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import {Message} from "@/models/User"

export async function POST(request: Request){
    await dbConnect()

    const {username, content} = await request.json()
    try {
        const user =  await UserModel.findOne({username})
        if(!user){
            return Response.json(
                {
                    success: false,
                    message: "User not found",
                }, {status: 404}
            )
        }

        // Is user accepting the messages
        if(!user.isAcceptingMessage){
            return Response.json(
                {
                    success: false,
                    message: "User is not accepting the messages"   
                },
                {status: 403}
            )
        }
        
        const newMessage = {content, createdAt: new Date()} // Go to model and in th message interface we can see there is content & createdAt hence we are extracting the same
        // user hai uske messages ke andar push kar dete hai
        user.messages.push(newMessage as Message)
        await user.save()

        return Response.json(
            {
                success: true,
                message: "Message send successfully"   
            },
            {status: 200}
        )
        
    } catch (error) {
        console.log("Error adding messages ",error);
        return Response.json(
            {
                success: false,
                message: "Internal Server Error",   
            },
            {status: 500}
        )
    }
}



















