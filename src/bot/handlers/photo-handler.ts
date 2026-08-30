import type { Context } from "grammy";
import { createIncomingPrompt, type IncomingPrompt } from "../../app/types/prompt.js";
import { flushPendingPrompt } from "./message-merger.js";
import { processUserPrompt, type ProcessPromptDeps } from "./prompt.js";

export interface PhotoHandlerDeps extends ProcessPromptDeps {
  processPrompt?: (
    ctx: Context,
    input: IncomingPrompt,
    deps: ProcessPromptDeps,
  ) => Promise<boolean>;
}

export async function handlePhotoMessage(ctx: Context, deps: PhotoHandlerDeps): Promise<void> {
  const photos = ctx.message?.photo;
  if (!photos || photos.length === 0) {
    return;
  }

  flushPendingPrompt(ctx.chat!.id);

  const caption = ctx.message.caption || "";
  const largestPhoto = photos[photos.length - 1];
  if (!largestPhoto) {
    return;
  }
  const processPrompt = deps.processPrompt ?? processUserPrompt;
  await processPrompt(
    ctx,
    createIncomingPrompt(caption, {
      photos: [
        {
          fileId: largestPhoto.file_id,
          filename: "photo.jpg",
          source: "standalone",
        },
      ],
    }),
    deps,
  );
}
