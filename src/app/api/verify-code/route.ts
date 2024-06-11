import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import {isValid, z} from "zod"
import {usernameValidation} from "@/schemas/signUpSchema" 

export async function POST(request: Request){
    await dbConnect()

    try {
        const {username,code} = await request.json()

        // decoding from url
        const decodedUsername = decodeURIComponent(username)
        const user =  await UserModel.findOne({username: decodedUsername})
        if(!user){
            return Response.json(
                {
                    success: false,
                    message:"User not found"
                }, {status: 500}
            )
        }
        
        const isCodeValid = user.verifyCode === code
        // Logic: The code in db is greater than current date then yeah it is a valid verifycode 
        // means when we are setting the verifyCodeExpiry in db we add more time to that. 
        // Hence here we are checking that that time is greater than current date.
        const isCodeNotExpired = new Date(user.verifyCodeExpiry)>new Date()

        if(isCodeValid && isCodeNotExpired){
            user.isVerified = true
            await user.save()
            return Response.json(
                {
                    success: true,
                    message:"Account verified succ"
                }, {status: 200}
            )
        }else if(!isCodeNotExpired) {
            return Response.json(
                {
                    success: false,
                    message:"Verification code has expired, please sign-up again to get a new code "
                }, {status: 400}
            )
        }else {
            return Response.json(
                {
                    success: false,
                    message:"Incorrect verification code, Please check you code and try again"
                }, {status: 400}
            )
        }
        
    } catch (error) {
        console.log("Error verifying user",error);
        
        return Response.json(
            {
                success: false,
                message:"Error verifying user"
            }, {status: 500}
        )
    }
    
}










