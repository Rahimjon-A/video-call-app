"use server";

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { StreamClient } from "@stream-io/node-sdk";

export async function getToken() {
  const streamApiKey = process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY;
  const streamApiSecret = process.env.STREAM_VIDEO_API_SECRET;

  if (!streamApiKey || !streamApiSecret) {
    throw new Error(" streamApiKey or streamApiSecret is invalid");
  }

  const user = await currentUser();

  console.log("Generate token for user", user?.id);

  if (!user) {
    throw new Error("user is not authed yet");
  }

  const streamClient = new StreamClient(streamApiKey, streamApiSecret);

  const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60;

  const issuedAt = Math.floor(Date.now() / 1000) - 60;

  const token = streamClient.createToken(user.id, expirationTime, issuedAt);

  console.log("Successfully generated tokent", token);

  return token;
}

export async function getUerIds(emailAddresses: string[]) {
  const response = await clerkClient.users.getUserList({
    emailAddress: emailAddresses,
  });

  return response.map((user) => user.id);
}
