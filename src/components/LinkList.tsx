'use client'
import React, { useEffect } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import Link from 'next/link';
import { Link as LinkType } from '@/lib/schema';
import { Loader, Star } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { LinkDeletionButton } from './LinkDeletionButton';

export default function LinkList() {

  const [links, setLinks] = React.useState<LinkType[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [allowEdit, setAllowEdit] = React.useState(false);

  useEffect(() => {
    async function fetchLinks() {
      try {
        // adjust this
        const response = await fetch(`/api/links/list`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token') || '',
            'userPlan': localStorage.getItem('userPlan') || ''
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch links');
        }

        const data = await response.json();
        setLinks(data.links);
        setAllowEdit(data.allowEdit);
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
          <TableHead className="text-zinc-300"></TableHead>
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
                  <TableCell className="text-zinc-300 cursor-pointer">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild className='cursor-pointer'>
                        <span>{window.location.origin + '/r/' + link.slug}</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className='bg-zinc-950'>
                        <DropdownMenuItem className='focus:bg-zinc-800/60 hover:bg-zinc-800/60 cursor-pointer' onClick={() => navigator.clipboard.writeText(window.location.origin + '/r/' + link.slug)}>
                          <span className='text-zinc-300'>copy</span>
                        </DropdownMenuItem>
                        {allowEdit ? (
                          <DropdownMenuItem onClick={() => window.location.href = `/edit?slug=${link.slug}`} className='focus:bg-zinc-800/60 hover:bg-zinc-800/60 cursor-pointer'>
                            <span className='text-zinc-300'>edit</span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className='focus:bg-zinc-800/60 hover:bg-zinc-800/60 cursor-pointer'>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className='flex items-center gap-2 align-middle justify-between w-full'>
                                  <span className='text-zinc-500'>edit </span>
                                  <Star className='w-4 h-4 fill-zinc-500' />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side='bottom' className='bg-zinc-950 flex flex-col gap-1'>
                                <p>this is a premium feature.</p>
                                <Link href="/pricing" className='text-lime-500 hover:text-lime-500/80'>learn more</Link>
                              </TooltipContent>
                            </Tooltip>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className='text-zinc-300 cursor-pointer'>
                    <LinkDeletionButton slug={link.slug} />
                  </TableCell>
                </TableRow>
          ))
        )}
      </TableBody>
    </Table >
  )
}
