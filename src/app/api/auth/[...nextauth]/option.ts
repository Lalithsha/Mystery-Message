import {NextAuthOptions} from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";



export const authOptions: NextAuthOptions={
    providers:[
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text"},
                password: { label: "Password", type: "password" }
              },
              async authorize(credentials:any, req):Promise<any> {
                    await dbConnect() // Connecting to database
                    try {
                        const user = await UserModel.findOne({
                            $or:[
                                {email: credentials.identifier.email}, // first value
                                {username: credentials.identifier}
                            ]
                        })

                        if(!user){
                            throw new Error("No user found with this email")
                        }

                        // User is present but not is not verified
                        if(!user.isVerified){
                            throw new Error("Please verify your account before login")
                        }
                        
                        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)
                        if(isPasswordCorrect){
                            return user // After checking the password is correct finally we are returning and the control goes back to credentials
                        }
                        else {
                            throw new Error("Incorrect Password")
                        }

                    } catch (err:any) {
                        throw new Error()
                    }
                    credentials               
                }
        })
    ],
    callbacks:{
        async session({ session, token }) {
            if(token){
                session.user._id = token._id
                session.user.isVerified = token.isVerified
                session.user.isAcceptingMessages = token.isAcceptingMessages
                session.user.username = token.username
            }
            return session
        },
        async jwt({ token, user }) {
            if(user){ // Adding extra fields to the token so that we can use that in future
                token._id = user._id?.toString()
                token.isVerified = user.isVerified
                token.isAcceptingMessages= user.isAcceptingMessages
                token.username = user.username
            }
            
            return token
        }
      
    },
    pages:{
        signIn: '/sign-in',
    },
    session:{
        strategy:"jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    
}






