import { z } from "zod";




export const signInSchema = z.object({
    identifier: z.string(),  // identifier: email
    password: z.string(),
})


































