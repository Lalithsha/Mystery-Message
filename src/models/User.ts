import mongoose,{Schema, Document} from "mongoose";


export interface Message extends Document{ // Message's Schema
    content: string;
    createdAt: Date
}

const MessageSchema: Schema<Message> = new Schema({
    content:{
        type: String, // Typescript here
        required: true
    },
    createdAt:{
        type: Date,
        required: true,
        default: Date.now
    }
})

export interface User extends Document{ // Message's Schema
    username: string;
    email: string;
    password: string;
    verifyCode: string;
    verifyCodeExpiry: Date;
    isVerified: boolean;
    isAcceptingMessage: boolean;
    messages: Message[]
}

const UserSchema: Schema<User> = new Schema({
    username:{
        type: String, // Typescript here
        required: [true,"Username is required"],
        trim: true,
        unique: true,
    },
    email:{
        type: String,
        required: [true,"Email is required"],
        unique: true,
        match: [/.+\@.+\..+/,'Please use a valid email address']
    },
    password:{
        type: String,
        required: [true,"Password is required"],

    },
    verifyCode:{
        type: String,
        required: [true,"Verify Code is required"],

    },
    verifyCodeExpiry:{
        type: Date,
        required: [true,"Verify Code is required"],
    },
    isVerified:{
        type: Boolean,
        default:false,
    },
    isAcceptingMessage:{
        type: Boolean,
        default: true,
    },
    messages:[MessageSchema]
    
})

const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User",UserSchema)


export default UserModel 

















