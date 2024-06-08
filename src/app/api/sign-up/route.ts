import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs"
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";



export async function POST(request: Request){
    await dbConnect()

    try {
        
        const {username, email, password} = await request.json()
        
        const existingUserVerifiedByUsername = await UserModel.findOne({username, isVerified: true})
        // User found and username is also taken
        if(existingUserVerifiedByUsername){
            return Response.json({
                success: false,
                message: "Username is already taken"
            },{status: 400})
        }
        
        const existingUserByEmail =  await UserModel.findOne({email})

        const verifyCode = Math.floor(10000+Math.random()*900000).toString();
        
        if(existingUserByEmail){
            
            if(existingUserByEmail.isVerified){ // Already registerd with this email
                return Response.json({
                    success: false,
                    message: "User already exists with this email",
                }, {status: 400})
            }
            else{ // existing user email se toh hai par verified nahi hai
                const hashedPassword = await bcrypt.hash(password,10)
                // Already user exist but he want to change the password
                existingUserByEmail.password = hashedPassword
                existingUserByEmail.verifyCode = verifyCode
                existingUserByEmail.verifyCodeExpriry = new Date(Date.now()+3600000)
                await existingUserByEmail.save()
            }
            
        } 
        else {  // existing user by email is not available then user does not exist by email meaning user is visiting first time
            const hashedPassword =  await bcrypt.hash(password,10)
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours()+1) // Getting the current time and adding +1 hour for expiry of verify code
            const newUser =  new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpriry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            })
            
            await newUser.save()
        }
        
        // send verification email
        const emailResponse =  await sendVerificationEmail(email,username,verifyCode)

        if(!emailResponse.success){
            return Response.json({
                success: false,
                message: emailResponse.message
            },{status:500}
            )
        }
        
        return Response.json({ // email response success. email sent
            success: true,
            message: "User Registered successfully. Please verify you email"
        },{status:201}
        )
        
    } catch (error) {
        console.error("Error regestering user", error);
        return Response.json({
            success: false,
            message: "Error registering user"
        },
        {
            status: 500
        }
    )
    }
    
}

