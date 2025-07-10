export async function isURLMalicious(url:string) {
    try {

        const apiKey = process.env.SAFE_BROWSING_API_KEY;
        const appVersion = process.env.APP_VERSION;
        if(!appVersion) {
            throw new Error("APP_VERSION is not set in environment variables");
        }
    
        if(!apiKey) {
            throw new Error("SAFE_BROWSING_API_KEY is not set in environment variables");
        }
        const body = {
            client: {
                clientId: "quickurl",
                clientVersion: appVersion
            },
            threatInfo: {
               threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
                platformTypes: ["ANY_PLATFORM"],
                threatEntryTypes: ["URL"],
                threatEntries: [
                    {
                        url: url
                    }
                ]
            }
        }
    
        const res = await fetch('https://safebrowsing.googleapis.com/v4/threatMatches:find?key=' + apiKey, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
    
        if (!res.ok) {
            throw new Error(`Error checking URL: ${res.status} ${res.statusText}`);
        }
    
        const data = await res.json();
    
        return !!data.matches;
    } catch (error) {
        console.error("Error in checking if URL is malicious:", error);
        throw new Error("Failed to check URL for malicious content");
    }
}