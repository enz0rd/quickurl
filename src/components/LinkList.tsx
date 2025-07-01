'use client'
import React, { useEffect } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import Link from 'next/link';
import { Link as LinkType } from '@/lib/schema';
import { useSearchParams } from 'next/navigation';
import { Loader } from 'lucide-react';

export default function LinkList() {

  const [links, setLinks] = React.useState<LinkType[]>([]);
  const [loading, setLoading] = React.useState(true);
  useEffect(() => {
    async function fetchLinks() {
      try {
        // adjust this
        const response = await fetch(`/api/links/list`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token') || ''
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch links');
        }

        const data = await response.json();
        setLinks(data.links);
      } catch (error) {
        setLoading(false);
        console.error('Error fetching links:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchLinks();
  }, [links.length]);

  return (
    <Table className='bg-zinc-950 overflow-hidden rounded-lg p-2'>
        <TableCaption className='text-zinc-400'>a list of your shortened links, click to edit</TableCaption>
        <TableHeader className='bg-zinc-800/80'>
          <TableRow>
            <TableHead className="text-zinc-300">Shortened Link</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={2} className="text-center text-zinc-400">
                <Loader className='h-6 w-6 m-4 mx-auto animate-spin' />
              </TableCell>
            </TableRow>
          )}
            {links.length === 0 && !loading ? (
            <TableRow>
              <TableCell colSpan={2} className="text-center text-zinc-400">
                No links found. Start by shortening a URL!
              </TableCell>
            </TableRow>
            ) : (
              links.map(link => (
                <TableRow key={link.id}>
                  <TableCell className="text-zinc-300 cursor-pointer"><Link href={`/edit?slug=${link.slug}`}>{window.location.origin + '/' + link.slug}</Link></TableCell>
                </TableRow>
              ))
            )}
        </TableBody>
    </Table>
  )
}
