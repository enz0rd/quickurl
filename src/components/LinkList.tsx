'use client'
import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from './ui/table'
import Link from 'next/link';
import { Link as LinkType } from '@/lib/schema';
import { ChevronLeft, ChevronRight, Loader, PencilIcon, Star } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { LinkDeletionButton } from './LinkDeletionButton';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Button } from './ui/button';
import toast from 'react-hot-toast';

type PaginationData = {
  list: LinkType[],
  totalCount: number,
  totalPages: number,
  currentPage: number,
  pageSize: number,
}

function getPagination(current: number, total: number) {
  const pages: (number | string)[] = [];
  if (total <= 4) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3 && current <= total) pages.push('...');
    let start = Math.max(2, current - 1);
    let end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push('...');
    pages.push(total);
  }
  return pages;
}

export default function LinkList() {

  const [paginationData, setPaginationData] = useState<PaginationData>({
    list: [],
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 5,
  });
  const [loading, setLoading] = useState(true);
  const [allowEdit, setAllowEdit] = useState(false);

  useEffect(() => {
    async function fetchLinks() {
      setLoading(true)
      try {
        const response = await fetch(`/api/links/list?page=${paginationData.currentPage}&limit=${paginationData.pageSize || 10}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token') || '',
            'userPlan': localStorage.getItem('userPlan') || ''
          }
        });

        if (!response.ok) {
          toast.error('Failed to fetch links. Please try again later.', {
            duration: 5000,
            position: "top-center",
            icon: "🚫",
            style: { backgroundColor: "#790000", color: "#fff" },
          });
          return;
        }

        const data = await response.json();
        setPaginationData(data.links);
        setAllowEdit(data.allowEdit);
      } catch (error) {
        setLoading(false);
        console.error('Error fetching links:', error);
        toast.error('Failed to fetch links. Please try again later.', {
          duration: 5000,
          position: "top-center",
          icon: "🚫",
          style: { backgroundColor: "#790000", color: "#fff" },
        });
      } finally {
        setLoading(false);
      }
    }

    fetchLinks();
  }, [paginationData.currentPage]); // 🚨 aqui está o segredo


  const handlePageChange = async (newPage: number) => {
    try {
      const newLinks = await fetch(`/api/links/list?page=${newPage}&limit=${paginationData.pageSize}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token') || '',
          'userPlan': localStorage.getItem('userPlan') || ''
        }
      });

      if (!newLinks.ok) {
        toast.error('Failed to fetch links. Please try again later.', {
          duration: 5000,
          position: "top-center",
          icon: "🚫",
          style: { backgroundColor: "#790000", color: "#fff" },
        });
        return;
      }
      const data = await newLinks.json();

      setPaginationData(data.links);

    } catch (error) {
      console.error('Error changing page:', error);
    }
  }


  return (
    <div className="container mx-auto px-4">
      <Table className="bg-zinc-950 overflow-hidden rounded-lg w-full">
        <TableCaption className="text-zinc-400">
          a list of your shortened links, click to edit
        </TableCaption>
        <TableHeader className="bg-zinc-800/80">
          <TableRow>
            <TableHead className="text-zinc-300 w-[40%] sm:w-[25%] text-center sm:text-left sm:table-cell">slug</TableHead>
            <TableHead className="text-zinc-300 w-[60%] sm:w-[60%] hidden sm:table-cell">original url</TableHead>
            <TableHead className="text-zinc-300 w-0 sm:w-[7.5%] hidden sm:table-cell" />
            <TableHead className="text-zinc-300 w-0 sm:w-[7.5%] hidden sm:table-cell" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-zinc-400">
                <Loader className="h-6 w-6 m-4 mx-auto animate-spin" />
              </TableCell>
            </TableRow>
          )}
          {!loading && paginationData.list.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-zinc-400">
                No links found. Start by shortening a URL!
              </TableCell>
            </TableRow>
          )}
          {!loading &&
            paginationData.list.map((link, index) => (
              <TableRow key={index}>
                {/* Mobile: slug + url juntos */}
                <TableCell className=" text-zinc-300 max-w-[300px] md:max-w-[600px] sm:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild className='cursor-pointer flex items-center justify-center'>
                      <span className='flex flex-row gap-2'>
                        <span className="truncate max-w-[50%] overflow-hidden">{link.slug}</span>
                        <span className="text-zinc-500"> | </span>
                        <span className="truncate max-w-[50%] overflow-hidden">{link.originalUrl.split("https://")[1]}</span>
                      </span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-zinc-950">
                      <DropdownMenuItem
                        className="focus:bg-zinc-800/60 hover:bg-zinc-800/60"
                        onClick={() => navigator.clipboard.writeText(window.location.origin + '/r/' + link.slug)}
                      >
                        <span className="text-zinc-300">copy</span>
                      </DropdownMenuItem>
                      {allowEdit ? (
                        <DropdownMenuItem
                          onClick={() => (window.location.href = `/edit?slug=${link.slug}`)}
                          className="focus:bg-zinc-800/60 hover:bg-zinc-800/60"
                        >
                          <span className="text-zinc-300">edit</span>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={(e) => e.preventDefault()} className="focus:bg-zinc-800/60 hover:bg-zinc-800/60">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <div className="flex items-center justify-between w-full">
                                <span className="text-zinc-500">edit</span>
                                <Star className="w-4 h-4 fill-zinc-500" />
                              </div>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-zinc-900 flex flex-col gap-1">
                              <AlertDialogTitle></AlertDialogTitle>
                              <AlertDialogDescription className='flex flex-col gap-2'>
                                this is a premium feature.
                                <Link href="/pricing" className="text-lime-500 hover:text-lime-500/80">
                                  learn more
                                </Link>
                              </AlertDialogDescription>
                              <AlertDialogFooter className="flex md:flex-row flex-col w-full">
                                <AlertDialogTrigger asChild>
                                  <Button
                                    className="mt-5 w-fit hover:text-zinc-700 text-zinc-800 hover:bg-zinc-200/80 bg-zinc-100 cursor-pointer mx-auto">
                                    Close
                                  </Button>
                                </AlertDialogTrigger>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={(e) => e.preventDefault()} className="focus:bg-zinc-800/60 hover:bg-zinc-800/60">
                        <LinkDeletionButton slug={link.slug} variant='text' />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                {/* Desktop: slug, url, editar, deletar */}
                <TableCell className="text-zinc-300 truncate max-w-[160px] sm:max-w-[200px] whitespace-nowrap hidden sm:table-cell">
                  {link.slug}
                </TableCell>
                <TableCell className="text-zinc-300 truncate max-w-[200px] sm:max-w-[300px] whitespace-nowrap hidden sm:table-cell">
                  {link.originalUrl}
                </TableCell>
                {/* Edit button */}
                <TableCell className="hidden sm:table-cell text-zinc-300">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild className='cursor-pointer flex items-center'>
                      <PencilIcon className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-zinc-950">
                      <DropdownMenuItem
                        className="focus:bg-zinc-800/60 hover:bg-zinc-800/60"
                        onClick={() => navigator.clipboard.writeText(window.location.origin + '/r/' + link.slug)}
                      >
                        <span className="text-zinc-300">copy</span>
                      </DropdownMenuItem>
                      {allowEdit ? (
                        <DropdownMenuItem
                          onClick={() => (window.location.href = `/edit?slug=${link.slug}`)}
                          className="focus:bg-zinc-800/60 hover:bg-zinc-800/60"
                        >
                          <span className="text-zinc-300">edit</span>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem className="focus:bg-zinc-800/60 hover:bg-zinc-800/60">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center justify-between w-full">
                                <span className="text-zinc-500">edit</span>
                                <Star className="w-4 h-4 fill-zinc-500" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="bg-zinc-950 flex flex-col gap-1">
                              <p>this is a premium feature.</p>
                              <Link href="/pricing" className="text-lime-500 hover:text-lime-500/80">
                                learn more
                              </Link>
                            </TooltipContent>
                          </Tooltip>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                {/* Delete */}
                <TableCell className="hidden sm:table-cell text-zinc-300">
                  <LinkDeletionButton slug={link.slug} />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      {paginationData.totalCount === 0 ? null : (
        <div className='flex items-center justify-center mt-3'>

          <div
            onClick={() => {
              if (paginationData.currentPage <= paginationData.totalPages) {
                if (paginationData.currentPage == 1) {
                  return; // Se já estiver na última página, não faz nada
                  // handlePageChange(paginationData.totalPages)
                } else {
                  handlePageChange(paginationData.currentPage - 1)
                }
              } else {
                handlePageChange(paginationData.totalPages)
              }
            }}

            className={`aspect-square p-1 bg-zinc-800/60 rounded-full mx-1 cursor-pointer`}>
            <ChevronLeft className="w-4 h-4" />
          </div>
          {getPagination(paginationData.currentPage, paginationData.totalPages).map((page, i) =>
            typeof page === 'number' ? (
              <div
                key={page}
                onClick={() => { paginationData.currentPage === page ? null : handlePageChange(page)}}
                className={`px-3 py-1 bg-zinc-800/60 rounded-full mx-1 cursor-pointer ${paginationData.currentPage === page ? 'border border-lime-500' : ''}`}>
                {page}
              </div>
            ) : (
              <div key={`ellipsis-${i}`} className="px-3 py-1 text-zinc-400 select-none">...</div>
            )
          )}
          <div
            onClick={() => {
              if (paginationData.currentPage <= paginationData.totalPages) {
                if (paginationData.currentPage == paginationData.totalPages) {
                  return; // Se já estiver na última página, não faz nada
                  // handlePageChange(paginationData.totalPages)
                } else {
                  handlePageChange(paginationData.currentPage + 1)
                }
              } else {
                handlePageChange(paginationData.totalPages)
              }
            }}
            className={`aspect-square p-1 bg-zinc-800/60 rounded-full mx-1 cursor-pointer ${paginationData.currentPage === paginationData.totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      )}
    </div >
  )
}
