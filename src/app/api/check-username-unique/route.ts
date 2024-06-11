import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import {z} from "zod"
import {usernameValidation} from "@/schemas/signUpSchema" 

// query schema - for checking object/variable

const UsernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request){

    // User this in all other routes
    /* if(request.method!=='GET'){ // Old code
        return Response.json({
            success: false,
            message: "Only GET method is allowed"
        },{status: 405})
    } */
    
    await dbConnect()

    try {
        // Getting url using url parameter
        const {searchParams} = new URL(request.url)
        const queryParam = {
            username: searchParams.get("username") // localhost:3000/api/check-username-unique=lalithsharma - (getting username here:lalithsharma)
        }
        
        // validate username 
        // Peforming this using zod
        const result = UsernameQuerySchema.safeParse(queryParam)
        console.log("result from check-username", result); // Remove in future
        console.log("result error", result.error?.format()); // Remove in future
        if(!result.success){
            const usernameErrors = result.error.format().username?._errors || []
            return Response.json({
                success: false,
                message: usernameErrors?.length>0? usernameErrors.join(','): "Invalid query parameters"
            },{status: 400})
        }
        
        console.log("result data", result.data);
        const {username} = result.data
        
        const existingVerifiedUser = await UserModel.findOne({ username, isVerified:true })
        if (existingVerifiedUser) {
            return Response.json(
                { success: false,
                  message: "Username is already taken"  
                }, {status: 400}
            )
        }

        return Response.json(
            {
                success: true,
                message:"Username is unique"
            },{status: 400}
        )
        
    } catch (error) {
        console.error("Error checking username", error);
        return Response.json(
            {
                success: false,
                message: "Error checking username"
            },
            {status: 500}
        )
    }
    
}








