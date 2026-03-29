import Joi from 'joi'

export function validateBody<T>(schema: Joi.ObjectSchema) {
  return (body: unknown): { error?: Joi.ValidationError; value?: T } => {
    return schema.validate(body, { abortEarly: false })
  }
}

export const orderSchema = Joi.object({
  name:         Joi.string().min(2).max(100).required(),
  email:        Joi.string().email().required(),
  phone:        Joi.string().min(7).max(20).required(),
  product:      Joi.string().required(),
  duration:     Joi.number().valid(1, 3, 6, 12).required(),
  total:        Joi.number().positive().required(),
  currency:     Joi.string().valid('INR','USD','AED','GBP','AUD','SGD','CAD','EUR','MYR','QAR','SAR','KWD').required(),
  referralCode: Joi.string().max(20).allow('').optional(),
})

export const upiSchema = Joi.object({
  orderId:   Joi.string().required(),
  utrNumber: Joi.string().min(6).max(30).required(),
})

export const clientSchema = Joi.object({
  name:         Joi.string().min(2).max(100).required(),
  whatsapp:     Joi.string().min(7).max(20).required(),
  contact:      Joi.string().optional(),
  service:      Joi.string().required(),
  plan:         Joi.string().required(),
  charge:       Joi.number().min(0).required(),
  cost:         Joi.number().min(0).required(),
  source:       Joi.string().valid('Instagram','WhatsApp','Referral','Website','Word of Mouth').required(),
  referralCode: Joi.string().optional().allow(''),
})

export const ticketSchema = Joi.object({
  uid:     Joi.string().required(),
  name:    Joi.string().required(),
  email:   Joi.string().email().required(),
  message: Joi.string().min(5).max(1000).required(),
})

export const activateSchema = Joi.object({
  orderId:     Joi.string().required(),
  credentials: Joi.string().min(5).required(),
})

export const renewSchema = Joi.object({
  clientId:  Joi.string().required(),
  newExpiry: Joi.string().isoDate().required(),
  charge:    Joi.number().min(0).required(),
})

export const paypalConfirmSchema = Joi.object({
  paypalOrderId: Joi.string().required(),
  name:          Joi.string().min(2).max(100).required(),
  email:         Joi.string().email().required(),
  phone:         Joi.string().min(7).max(20).allow('').default(''),
  product:       Joi.string().required(),
  duration:      Joi.number().valid(1, 3, 6, 12).required(),
  total:         Joi.number().positive().required(),
  currency:      Joi.string().valid('INR','USD','AED','GBP','AUD','SGD','CAD','EUR','MYR','QAR','SAR','KWD').required(),
})
