'use client'
import FooterInfo from '@/components/FooterInfo'
import React, { useEffect, useState } from 'react'
import Header from '../header'
import { Link } from '@/lib/schema'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast, { Toaster } from 'react-hot-toast'
import { Loader } from 'lucide-react'

const linkSchema = z.object({
    slug: z.string().min(6, {
        message: "link slug should have at least 6 characters"
    }),
    originalUrl: z.string()
})

type LinkSchema = z.infer<typeof linkSchema>;

export default function Page() {
    const [fetchLink, setFetchedLink] = useState<Link>({} as Link);
    const [isFetching, setFetching] = useState(false);
    
    const {
    formState,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<LinkSchema>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      slug: '',
      originalUrl: ''
    },
  });

  // fetching link data
  useEffect(() => {
    async function fetchLinkData() {
        try {
            const token = localStorage.getItem('token');
            const plan = localStorage.getItem('userPlan');
            const res = await fetch("/api/links/update", {
                method: "GET",
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': token || "",
                    'UserPlan': plan || ""
                }
            })

            const result = await res.json();
            if(!res.ok) {
                throw new Error('Failed to fetch link data');
            }

            if(result.id) {
                setFetchedLink({
                    id: result.id,
                    slug: result.slug,
                    originalUrl: result.originalUrl,
                    userId: result.userId,
                    createdAt: result.createdAt,
                    updatedAt: result.updatedAt
                })
                setFetching(false);
            }

        } catch (error: any) {
            setFetching(false);
            toast.error(error.message || "An error occurred, please try again later", {
                duration: 3000,
                position: "bottom-center",
                icon: "🚫",
                style: { backgroundColor: "#790000", color: "#fff" },
              });
        }
    }
    fetchLinkData();
  }, [fetchLink])

  const onError = (errors: any) => {
    if(errors.originalUrl) {
        toast.error(errors.originalUrl.message || "Please check original URL entered", {
            duration: 3000,
            position: "bottom-center",
            icon: "🚫",
            style: { backgroundColor: "#790000", color: "#fff" },
          });
        } else {
            toast.error(errors.slug.message || "Please check the slug entered", {
                duration: 3000,
                position: "bottom-center",
                icon: "🚫",
                style: { backgroundColor: "#790000", color: "#fff" },
            });
    }
  }

  const onSubmit = (data: LinkSchema) => {
    alert(data)
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Header />
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex flex-col gap-2 items-center">
          <h1 className="text-4xl font-bold">edit link</h1>
          <p className="text-gray-500 text-md mx-2 text-wrap">
            editing link with slug {}
          </p>
            {isFetching ? (
                <Loader className='h-6 w-6 animate-spin m-auto' />
            ) : (
                <form onSubmit={handleSubmit(onSubmit, onError)}>
                    
                </form>
            )}

            <Toaster />
        </div>
      </main>
      <footer className="flex flex-col items-center justify-center fixed-bottom-0 left-0 right-0 gap-3">
        <FooterInfo />
      </footer>
    </div>
  )
}
