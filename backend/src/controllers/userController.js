import { asyncHandler } from '../utils/asyncHandler.js';
import { badRequest } from '../utils/AppError.js';
import { blobEnabled, saveAvatarToBlob } from '../utils/storage.js';
export function createUserController({ userService }) {
  return {
    list: asyncHandler(async (req, res) => res.json(await userService.list(req.user, req.valid.query))),
    teachers: asyncHandler(async (_req, res) => res.json(await userService.listTeachers())),
    get: asyncHandler(async (req, res) =>
      res.json(await userService.getById(req.user, req.valid.params.id))),
    create: asyncHandler(async (req, res) =>
      res.status(201).json(await userService.create(req.valid.body))),
    update: asyncHandler(async (req, res) =>
      res.json(await userService.update(req.user, req.valid.params.id, req.valid.body))),
    remove: asyncHandler(async (req, res) => {
      await userService.remove(req.user, req.valid.params.id);
      res.status(204).end();
    }),
        avatar: asyncHandler(async (req, res) => {
      if (!req.file) throw badRequest('Envie o arquivo no campo "avatar"');
      const url = blobEnabled()
        ? await saveAvatarToBlob(req.file)
        : `/uploads/${req.file.filename}`;
      res.json(await userService.setAvatar(req.valid.params.id, url));
    }),
  };
}
