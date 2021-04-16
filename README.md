# CodeTools Frontend
This is the frontend for CodeTools, written in React with Gatsby. Run like any other Gatsby project. There are some specifics though.  

## (for reference) Components of CodeTools  
1. Static Frontend - Gatsby  
2. API - Python Flask (WSGI)
3. Run Management System (managementWS.py) - Python Websockets (*NOT* WSGI)
4. Runner Node(s) - Kotlin/Java

## Environment Variables
You need to set various environment variables in order for Gatsby to build the site correctly. Templates are available in:  
- `sample.env.production` and `sample.env.development` for building **only the frontend**
- `sample.env` for building and running **both the static frontend *and* the API** on a hosting service such as Vercel

## Hosting Both Static Frontend and API with Vercel
Vercel supports hosting sites with Python APIs. As a result, components 1 and 2 can be hosted on Vercel together. This has been tested, and works. 
The only configuration neccesary will be to set the environment variables in Vercel for your configuration.