import { z } from 'zod';
import { PRODUCT_TYPES } from '@/lib/product-type';
import { isShopSku } from '@/lib/shop-products';

/* -------------------------------------------------------------------------- */
/*  Auth                                                                      */
/* -------------------------------------------------------------------------- */

export const otpStartSchema = z.object({
  phone: z.string().min(7).max(20),
});

export const otpVerifySchema = z.object({
  phone: z.string().min(7).max(20),
  code: z.string().regex(/^\d{6}$/, 'Code must be exactly 6 digits'),
});

/* -------------------------------------------------------------------------- */
/*  Orders                                                                    */
/* -------------------------------------------------------------------------- */

export const createOrderSchema = z.object({
  quantity: z.number().int().min(1).max(20),
  shopSku: z
    .string()
    .optional()
    .refine((s) => s == null || s === '' || isShopSku(s), { message: 'Invalid shop product' }),
  shipping: z.object({
    fullName: z.string().min(2).max(80),
    phone: z.string().min(7).max(20),
    address1: z.string().min(5).max(200),
    address2: z.string().max(200).optional().or(z.literal('')),
    city: z.string().min(2).max(80),
    province: z.enum(['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Islamabad', 'AJK', 'GB']),
  }),
  paymentMethod: z.enum(['COD', 'JAZZCASH']),
  notes: z.string().max(500).optional().or(z.literal('')),
});

/* -------------------------------------------------------------------------- */
/*  Tag activation & lifecycle                                                */
/* -------------------------------------------------------------------------- */

const metadataRecordSchema = z.record(z.unknown()).optional();

export const createDashboardTagSchema = z.object({
  productType: z.enum(PRODUCT_TYPES),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  metadata: metadataRecordSchema,
});

export const activateTagSchema = z
  .object({
    productType: z.enum(PRODUCT_TYPES).optional(),
    vehicle: z
      .object({
        plate: z.string().min(2).max(15).transform((s) => s.toUpperCase().trim()),
        make: z.string().min(1).max(40),
        model: z.string().max(40).optional().or(z.literal('')),
        color: z.string().min(1).max(30),
        year: z.coerce.number().int().min(1950).max(new Date().getFullYear() + 1).optional(),
      })
      .optional(),
    title: z.string().trim().max(120).optional().or(z.literal('')),
    description: z.string().trim().max(500).optional().or(z.literal('')),
    metadata: metadataRecordSchema,
    publicName: z
      .string()
      .min(1, 'Display name is required')
      .max(40, 'Keep it short, first name and initial is fine'),
  })
  .superRefine((data, ctx) => {
    const pt = data.productType ?? 'CAR';
    if (pt === 'CAR') {
      if (!data.vehicle) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Fill in the details required for this tag type (vehicle tags need plate, make, and colour).',
        });
      }
    } else if (!data.title?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Title is required.', path: ['title'] });
    }
  });

export const updateTagSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  metadata: metadataRecordSchema,
  publicName: z.string().trim().min(1).max(40).optional(),
});

export const markLostSchema = z.object({
  lastSeenCity: z.string().max(80).optional().or(z.literal('')),
  rewardPkr: z.coerce.number().int().nonnegative().max(1_000_000).optional(),
  message: z.string().max(280).optional().or(z.literal('')),
});

/* -------------------------------------------------------------------------- */
/*  Public contact (the privacy relay)                                        */
/* -------------------------------------------------------------------------- */

export const contactMessageSchema = z.object({
  body: z
    .string()
    .min(2, 'Please write at least a couple of words')
    .max(500, 'Message is too long'),
  finderPhone: z.string().min(0).max(20).optional().or(z.literal('')),
  geo: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .optional(),
});

export const foundClaimSchema = contactMessageSchema; // same shape

/* -------------------------------------------------------------------------- */
/*  Type exports                                                              */
/* -------------------------------------------------------------------------- */

export type OtpStartInput = z.infer<typeof otpStartSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateDashboardTagInput = z.infer<typeof createDashboardTagSchema>;
export type ActivateTagInput = z.infer<typeof activateTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
export type MarkLostInput = z.infer<typeof markLostSchema>;
export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
