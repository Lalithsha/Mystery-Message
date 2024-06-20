"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import  * as z  from "zod"


import { useDebounceCallback } from 'usehooks-ts' // usehooks-ts.com
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

import { signUpSchema } from "@/schemas/signUpSchema"

import axios, {AxiosError} from 'axios';
import { ApiResponse } from "@/types/ApiResponse"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { signInSchema } from "@/schemas/signInSchema"
import { signIn } from "next-auth/react"

const Page = () => {

  /* const [username, setUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('')
  const [isCheckingUsername, setIsCheckingUsername] = useState(false) */
  // const [isSubmitting, setIsSubmitting] = useState(false)

  // const debounced =  useDebounceCallback(setUsername,300)
  const { toast } = useToast()
  const router = useRouter()

  // Zod implementation
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues:{
      identifier: '',
      password:'',
    }
  })
  
  /* useEffect(()=>{
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
  },[username]) */
  
  const onSubmit = async (data: z.infer<typeof signInSchema>)=>{
    const result = await signIn('credentials',{
      redirect: false,
      identifier: data.identifier,
      password: data.password
    })

    console.log("result from sign-in: ", result);

    /* if(result?.error){
      toast({
        title: "Login Failed",
        description: "Incorrect username or password.",
        variant: "destructive"
      })
    }  */

    if(result?.error){
      if(result.error == 'CredentialsSignin'){
        toast({
          title: "Login Failed",
          description: "Incorrect username or password.",
          variant: "destructive"
        })
      } 
      else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        })
      }
    }

    if(result?.url){
      router.replace('/dashboard')
    }
    
  }
  
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800" >
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
      <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Welcome Back to True Feedback
          </h1>
          <p className="mb-4">Sign in to start your anonymous adventure</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" >

         <FormField
          name="identifier"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email/Username</FormLabel>
              <FormControl>
                <Input placeholder="email/username" {...field} 
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="password" {...field} 
                />
                
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" > {/* // disabled={isSubmitting} */}
            Sign-in
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

  
  