import Joi from "joi";
import { findPhotoById } from "@/models/admin/photo.model";
import { NotFoundError } from "../errors";

export async function isValidPhotoModeration(
  id: number,
  status: string,
  moderationMessage: string
) {

  const schema = Joi.object({
    id: Joi.number().integer().positive().required(),
    status: Joi.string().valid('APPROVED', 'REJECTED').required(),
    moderationMessage: Joi.string().min(8).max(500).required(),
  });

  const validationResult = schema.validate({
    id,
    status,
    moderationMessage,
  });

  if (validationResult.error) {
    return {
      success: false,
      message: validationResult.error.details[0].message,
    };
  }

  const photo = await findPhotoById(id);

  if (!photo) {
    throw new NotFoundError("Photo not found");
  }

  return {
    success: true,
    message: "Valid moderation",
  };

}