import { queryOptions } from '@tanstack/react-query';
import { notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { type } from 'arktype';

const postSchema = type({
  id: 'number',
  title: 'string',
  body: 'string',
});

export type PostType = typeof postSchema.infer;

export const postQueryOptions = (postId: string) =>
  queryOptions({
    queryKey: ['post', postId],
    queryFn: () => fetchPost({ data: postId }),
    persister: (data, ctx) => data(ctx),
  });

const fetchPost = createServerFn({ method: 'GET' })
  // TODO: Validator
  .validator((postId: string) => postId)
  .handler(async ({ data }) => {
    console.info(`Fetching post with id ${data}...`);

    const responseData = await fetch(
      `https://jsonplaceholder.typicode.com/posts/${data}`
    );

    if (responseData.status === 404) {
      throw notFound();
    }

    if (!responseData.ok) {
      throw new Error('Failed to fetch post');
    }

    const json = await responseData.json();

    const parsed = postSchema(json);

    if (parsed instanceof type.errors) {
      throw new Error(parsed.summary);
    }

    return parsed;
  });

export const postsQueryOptions = () =>
  queryOptions({
    queryKey: ['posts'],
    queryFn: () => fetchPosts(),
    persister: (data, ctx) => data(ctx),
  });

const fetchPosts = createServerFn({ method: 'GET' }).handler(async () => {
  console.info('Fetching posts...');
  await new Promise((r) => setTimeout(r, 1000));

  const data = await fetch('https://jsonplaceholder.typicode.com/posts');

  if (!data.ok) {
    throw new Error('Failed to fetch posts');
  }

  const json = await data.json();

  const take10 = Array.isArray(json) ? json.slice(0, 10) : [];

  const parsed = postSchema.array()(take10);

  if (parsed instanceof type.errors) {
    throw new Error(parsed.summary);
  }

  return parsed.slice(0, 10);
});
