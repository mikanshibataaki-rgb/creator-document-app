import { promises as fs } from "fs";
import path from "path";

import { createPost } from "./postFactory";
import { PostInput, PostRecord } from "./types";

const DATA_PATH = path.join(process.cwd(), "data", "posts.json");

async function ensureDataFile() {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });

  try {
    await fs.access(DATA_PATH);
  } catch {
    await fs.writeFile(DATA_PATH, "[]", "utf-8");
  }
}

export async function listPosts(): Promise<PostRecord[]> {
  await ensureDataFile();
  const text = await fs.readFile(DATA_PATH, "utf-8");
  const posts = JSON.parse(text) as PostRecord[];
  return posts.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export async function getPost(id: string): Promise<PostRecord | null> {
  const posts = await listPosts();
  return posts.find((post) => post.id === id) ?? null;
}

export async function createPostRecord(input: PostInput): Promise<PostRecord> {
  const posts = await listPosts();
  const post = createPost(input);
  await writePosts([post, ...posts]);
  return post;
}

export async function updatePostRecord(
  id: string,
  input: Partial<PostRecord>
): Promise<PostRecord | null> {
  const posts = await listPosts();
  let updatedPost: PostRecord | null = null;
  const nextPosts = posts.map((post) => {
    if (post.id !== id) {
      return post;
    }

    updatedPost = {
      ...post,
      ...input,
      id: post.id,
      created_at: post.created_at,
      updated_at: new Date().toISOString()
    };
    return updatedPost;
  });

  await writePosts(nextPosts);
  return updatedPost;
}

async function writePosts(posts: PostRecord[]) {
  await ensureDataFile();
  await fs.writeFile(DATA_PATH, JSON.stringify(posts, null, 2), "utf-8");
}
