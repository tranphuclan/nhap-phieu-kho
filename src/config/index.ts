// import { config } from "dotenv";

// const path = ".env"
// console.table({ env_path: path })
// config({ path })

// const getEnvString = (key: string) => {
//     if (!process.env[key]) throw new Error(`${key} must be provided`)
//     return process.env[key] as string
// }

// export const DATABASE_URL = getEnvString("DATABASE_URL")
// export const DATABASE_NAME = getEnvString("DATABASE_NAME")
// export const PORT = Number(getEnvString("PORT"))

export const DATABASE_URL = process.env.DATABASE_URL as string
export const DATABASE_NAME = process.env.DATABASE_NAME as string
export const PORT = Number(process.env.PORT) as number