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
    }).optional(),
    groupId: z.string().optional(),
  }).strict();;

export const urlShortenerFormSchemaAPI = z.object({
    url: z.string().url({
      message: "Invalid URL",
    }),
    slug: z.string().min(6, {
      message: "Please use a slug that is at least 6 characters long"
    }),
    groupId: z.string().optional(),
}).strict();

export const editLinkSchema = z.object({
  originalUrl: z.string().url({
    message: "Invalid URL",
  }).optional(),
  slug: z.string().min(6, {
    message: "Please use a slug that is at least 6 characters long"
  }).optional(),
  groupId: z.string().optional(),
  expDate: z.string().optional(),
  uses: z.number().optional(),
  password: z.string().optional(),
}).strict();

export const createApiKeySchema = z.object({
  name: z.string().min(5, {
    message: "Please use a name that is at least 5 characters long"
  }),
  expiresAt: z.string().optional(),
}).strict();

export const createGroupSchema = z.object({
  name: z.string().min(5, {
    message: "Please use a name that is at least 5 characters long"
  }),
  description: z.string().optional(),
  shortName: z.string().max(4, {
    message: "Please use a short name that is at most 4 characters long"
  }),
}).strict();

export const editGroupSchema = z.object({
  name: z.string().min(5, {
    message: "Please use a name that is at least 5 characters long"
  }).optional(),
  description: z.string().optional(),
  shortName: z.string().max(4, {
    message: "Please use a short name that is at most 4 characters long"
  }).optional(),
}).strict();

export type Link = {
  id: string;
  slug: string;
  originalUrl: string;
  userId: string | null;
  uses: number;
  expDate: string;
  createdAt: string;
  updatedAt: string;
  group?: {
    id: string;
    name: string;
    shortName: string | null;
  };
}

export type Group = {
  id: string;
  name: string;
  description: string | null;
  shortName: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}