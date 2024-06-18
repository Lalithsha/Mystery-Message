"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import  * as z  from "zod"


import { useDebounceValue, useDebounceCallback } from 'usehooks-ts' // usehooks-ts.com
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

import { signUpSchema } from "@/schemas/signUpSchema"

import axios, {AxiosError} from 'axios';
import { ApiResponse } from "@/types/ApiResponse"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

const Page = () => {

  const [username, setUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('')
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const debounced =  useDebounceCallback(setUsername,300)
  const { toast } = useToast()
  const router = useRouter()

  // Zod implementation
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues:{
      username:'',
      email: '',
      password:'',
    }
  })
  
  useEffect(()=>{
    const checkUsernameUnique = async()=>{
      if(username){
        setIsCheckingUsername(true)
        setUsernameMessage('')
        try {
          const response =  await axios.get(`/api/check-username-unique?username=${username}`)
          setUsernameMessage(response.data.message)
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>; 
          setUsernameMessage(
            axiosError.response?.data.message ?? "Error checking username"
          )
        } finally{
          setIsCheckingUsername(false);
        }
      }
    }
    checkUsernameUnique();
  },[username])
  
  const onSubmit = async (data: z.infer<typeof signUpSchema>)=>{
    setIsSubmitting(true)
    try {
      console.log("printing Data from sign-in: ",data);
      const response =  await axios.post<ApiResponse>('/api/sign-up', data)

      toast({
        title: "Success",
        description: response.data.message
      })
      router.replace(`/verify/${username}`)
      setIsSubmitting(false)

    } catch (error) {
      console.error("Error in sign-up of user", error);
      const axiosError = error as AxiosError<ApiResponse>; 
      let errorMessage = axiosError.response?.data.message
      toast({
        title: "sign-up failed",
        description: errorMessage,
        variant:"destructive"
      })
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800" >
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
      <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Welcome Back to True Feedback
          </h1>
          <p className="mb-4">Sign in to continue your secret conversations</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" >
          <FormField
          name="username"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="username" {...field} 
                onChange={(e)=>{ field.onChange(e) 
                  debounced(e.target.value) 
                }
              }
              />
              </FormControl>
              {isCheckingUsername && <Loader2 className="animate-spin" />}
              <p className={`text-sm ${usernameMessage===" Username is unique" ?'text-green-500':'text-red-500'}`} > 
                {username} is unique
              </p>
              <FormMessage/>
            </FormItem>
          )}
        />

         <FormField
          name="email"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email" {...field} 
                />
                
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        
        <FormField
          name="password"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pasword</FormLabel>
              <FormControl>
                <Input type="password" placeholder="password" {...field} 
                />
                
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting} >
            {
              isSubmitting ? (
                <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait...
                </>
              ):('Sign-Up')
            }
        </Button>
        
          </form>
        </Form>
        
        <div className="text-center mt-4" >
            <p>
              Already a memeber?{''}
              <Link href="/sign-in" 
              className="text-blue-600 hover:text-blue-800" >
                Sign-in
              </Link>
            </p>
        </div>
        
      </div>
      </div>
    
  
  )
} 
export default Page


/* import { useSession, signIn, signOut } from "next-auth/react"

export default function Component() {
  const { data: session } = useSession()
  if (session) {
    return (
      <>
        Signed in as {session.user.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    )
  }
  return (
    <>
      Not signed in <br />
      <button className="bg-orange-500 px-3 py-1 m-4 rounded" onClick={() => signIn()}>Sign in</button>
    </>
  )
} */

  
  