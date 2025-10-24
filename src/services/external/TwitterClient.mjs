import { Client } from "twitter-api-sdk";


const USER_ID='yalishiduoqing'
const bearerToken='AAAAAAAAAAAAAAAAAAAAAMbKrQEAAAAATWuWGCPexv9xO5gzo2c84PaUj50%3DSc5dxi6kUO36B0i8ijAKTlYWPDGv7mYGIwhuiH7U5EIlvtc8Uz'

const client = new Client(bearerToken);

async function getBookmarks() {
    

    try {
        const bookmarks = await client.bookmarks.getUsersIdBookmarks(USER_ID,{},{
        })
        
    } catch (error) {
        console.error('Error fetching bookmarks:', error);
    }
}

getBookmarks();
