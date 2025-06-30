import z from "zod";

export const urlShortenerFormSchema = z.object({
    url: z.string().url({
      message: "Invalid URL",
    }),
    turnstile: z.string().min(1, {
      message: "Please verify that you are human by completing the captcha.",
    }),
    slug: z.string().min(6, {
      message: "Please use a slug that is at least 6 characters long"
    }).optional()
  });

export type Link = {
  id: string;
  slug: string;
  originalUrl: string;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}