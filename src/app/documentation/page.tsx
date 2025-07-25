import ApiLink from "@/components/documentation/ApiLink";
import Header from "../header";
import FooterInfo from "@/components/FooterInfo";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula, oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const apiLinksData = [
    {
        path: "/api/shorten",
        protocol: "POST",
        documentation: {
            description: "Create a new short url using this route with the POST method",
            parameters: `{
  "url": "https://prettybigurl.com/that-you-want-to-shorten",
  "slug": "slug", // optional
  "groupId": "groupId" // optional
}`,
            response: `{
  "shortenedURL": "https://quickurl.com.br/r/slug"
}`,
        },
    },
    {
        path: "/api/links/list",
        protocol: "GET",
        documentation: {
            description: "List all links created by the user using this route with the GET method",
            parameters: `Optional URL params: ?page=1&limit=5&search=text&groupId=id-of-the-group`,
            response: `{
    "links": {
        "list": [
            {
                "id": "link-id-here",
                "slug": "definedSlug",
                "originalUrl": "https://reallybigexampleurl.com/that-you-want-to-shorten",
                "uses": 0,
                "timesUsed": 0,
                "expDate": "2025-07-30T10:09:11.415Z",
                "isMalicious": false,
                "isURLChecked": false,
                "urlCheckedAt": null,
                "password": null,
                "userId": "user-id",
                "groupId": "group-id",
                "createdAt": "2025-07-25T13:09:11.153Z",
                "updatedAt": "2025-07-25T13:09:11.428Z",
                "group": {
                    "shortName": "TEST"
                }
            }
        ],
        "totalCount": 1,
        "totalPages": 1,
        "currentPage": 1,
        "pageSize": 5
    },
    "allowEdit": false,
    "allowDA": false,
    "allowQRCode": false
}`,
        },
    },
    {
        path: "/api/links/update",
        protocol: "PATCH",
        documentation: {
            description: "Update a link using this route with the PATCH method",
            parameters: `URL Params: ?slug=linkSlug
{   // all parameters are optional, but at least one of them is required 
    "dataToUpdate": {
        "slug": "newSlug", 
        "originalUrl": "https://prettybigurl.com/that-you-want-to-shorten", 
        "uses": 0, 
        "expDate": "2025-07-30T10:09:11.415Z", 
        "password": "urlPassword", 
        "groupId": "cmdiqoi7a0006nkp4mi05ze3v"
    },
    "resetPassword": false 
}`,
            response: `{
    "message": "Link updated successfully",
    "data": {
        "id": "link-id-here",
        "slug": "newSlug",
        "originalUrl": "https://prettybigurl.com/that-you-want-to-shorten",
        "uses": 0,
        "timesUsed": 0,
        "expDate": "2025-07-30T11:10:04.814Z",
        "isMalicious": false,
        "isURLChecked": false,
        "urlCheckedAt": null,
        "password": null,
        "userId": "user-id-here",
        "groupId": null,
        "createdAt": "2025-07-25T14:10:04.797Z",
        "updatedAt": "2025-07-25T14:57:11.713Z"
    }
}`,
        }
    },
    {
        path: "/api/links/delete",
        protocol: "DELETE",
        documentation: {
            description: "Delete a link using this route with the DELETE method",
            parameters: `URL Params: ?slug=linkSlug`,
            response: `{
    "message": "Link deleted successfully"
}`,
        }
    },
    {
        path: "/api/groups/list",
        protocol: "GET",
        documentation: {
            description: "List all groups created by the user using this route with the GET method",
            parameters: `Optional URL params: ?page=1&limit=5&search=text`,
            response: `{
    "groups": {
        "list": [
            {
                "id": "group-id",
                "name": "group name",
                "description": "group description",
                "ownerId": "user-id",
                "shortName": "GROUP-SHORTNAME",
                "createdAt": "2025-07-25T11:29:44.999Z",
                "updatedAt": "2025-07-25T12:56:23.956Z"
            }
        ],
        "totalCount": 1,
        "totalPages": 1,
        "currentPage": 1,
        "pageSize": 5
    }
}`
        }
    },
    {
        path: "/api/groups/create",
        protocol: "POST",
        documentation: {
            description: "Create a group using this route with the POST method",
            parameters: `{
    "name": "group name",
    "description": "group description",
    "shortName": "GROUP-SHORTNAME" // 4 characters max
}`,
            response: `{
    "message": "Group created successfully",
}`,
        }
    },
    {
        path: "/api/groups/update",
        protocol: "PATCH",
        documentation: {
            description: "Update a group using this route with the PATCH method",
            parameters: `{
    "name": "group name",
    "description": "group description",
    "shortName": "GROUP-SHORTNAME" // 4 characters max
}`,
            response: `{
    "message": "Group updated successfully",
}`,
        }
    },
    {
        path: "/api/groups/remove-link",
        protocol: "PATCH",
        documentation: {
            description: "Remove a link from a group using this route with the PATCH method",
            parameters: `URL Params: ?id=group-id-here&linkId=link-id-here`,
            response: `{
    "message": "Link removed from group",
}`,
        }
    },
    {
        path: "/api/groups/delete",
        protocol: "DELETE",
        documentation: {
            description: "Delete a group using this route with the DELETE method",
            parameters: `URL Params: ?id=group-id-here`,
            response: `{
    "message": "Group deleted successfully",
}`,
        }
    },
    {
        path: "/api/keys/list",
        protocol: "GET",
        documentation: {
            description: "List all api keys created by the user using this route with the GET method",
            response: `{
    "list": [
        {
            "id": "api-key-id",
            "name": "key-name",
            "key": "encoded-api-key",
            "expiresAt": "2025-07-30T02:59:59.999Z"
        },
    ]
}`
        }
    },
    {
        path: "/api/keys/create",
        protocol: "POST",
        documentation: {
            description: "Create an api key using this route with the POST method",
            parameters: `{
    "name": "key-name",
    "expiresAt": "2025-07-30T02:59:59.999Z"
}`,
            response: `{
    "key": "encoded-api-key-here",
}`,
        }
    },
    {
        path: "/api/keys/delete",
        protocol: "DELETE",
        documentation: {
            description: "Delete an api key using this route with the DELETE method",
            parameters: `URL Params: ?keyId=api-key-id-here`,
            response: `{
    "message": "API key deleted successfully",
}`,
        }
    }
]

export default function Page() {
    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <Header />
            <main className="flex flex-col gap-[32px] row-start-2 items-center justify-center sm:items-start">
                <div className="flex flex-col gap-2 items-center mx-auto">
                    <h1 className="text-4xl font-bold text-center">api documentation</h1>
                    <p className="text-gray-500 text-md mx-2 text-wrap text-center">
                        here you can find the api documentation for quickurl
                    </p>
                </div>
                <div className="container flex flex-col gap-2 text-wrap justify-center items-center">
                    {apiLinksData.map((link, i) => (
                        <ApiLink key={i} path={link.path} protocol={link.protocol as "GET" | "POST" | "PATCH" | "DELETE"}>
                            <p className="text-wrap">{link.documentation.description}</p>
                            <span className="text-zinc-100 font-bold mt-2 text-lg">Headers</span>
                            <ScrollArea className="bg-zinc-950/60 rounded-lg mt-2 whitespace-pre-wrap break-words text-sm">
                                <SyntaxHighlighter
                                    language="json"
                                    style={dracula}
                                    customStyle={{ background: 'transparent' }}
                                >
                                    "Authorization": "your-api-key" // Grab yours at the account management page
                                </SyntaxHighlighter>
                                <ScrollBar orientation="horizontal" className="mb-2 ml-2 transition"/>
                            </ScrollArea>
                            {link.documentation.parameters && (
                                <>
                                    <span className="text-zinc-100 font-bold mt-2 text-lg">Parameters</span>
                                    <ScrollArea className="bg-zinc-950/60 rounded-lg mt-2 whitespace-pre-wrap break-words text-sm">
                                        <SyntaxHighlighter
                                            language="json"
                                            style={dracula}
                                            customStyle={{ background: 'transparent' }}
                                        >
                                            {link.documentation.parameters}
                                        </SyntaxHighlighter>
                                        <ScrollBar orientation="horizontal" className="mb-2 ml-2 transition"/>
                                    </ScrollArea>
                                </>
                            )}
                            <span className="text-zinc-100 font-bold mt-2 text-lg">Response <code className="bg-green-800 py-[.15rem] px-[.4rem] rounded-lg">200</code></span>
                            <ScrollArea className="bg-zinc-950/60 rounded-lg mt-2 whitespace-pre-wrap break-words text-sm">
                                <SyntaxHighlighter
                                    language="json"
                                    style={dracula}
                                    customStyle={{ background: 'transparent' }}
                                >
                                    {link.documentation.response}
                                </SyntaxHighlighter>
                                <ScrollBar orientation="horizontal" className="mb-2 ml-2 transition"/>
                            </ScrollArea>
                        </ApiLink>
                    ))}
                </div>
            </main>
            <footer className="row-start-3 flex flex-col gap-[24px] m-auto flex-wrap items-center justify-center">
                <Link href="/" className="flex flex-row gap-2 items-center">
                    <ArrowLeft className="w-4 h-4" />
                    <p>back to home</p>
                </Link>
                <FooterInfo />
            </footer>
        </div>
    );
};