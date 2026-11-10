/**
 * Post Repository
 *
 * Storage-Swap Proof:
 * This repository is implemented using an in-memory Map-backed store to demonstrate
 * that callers depend solely on the repository contract, not the underlying storage technology.
 *
 * When replacing this repository with a Prisma-backed implementation:
 *
 * WHAT WILL CHANGE:
 * - Only this repository file (postRepository.js) will change.
 * - The private in-memory Map (`posts`) and manual ID generator (`nextId`) will be replaced
 *   by Prisma Client queries (e.g. `prisma.post.findMany()`, `prisma.post.findUnique()`,
 *   `prisma.post.create()`, `prisma.post.update()`, `prisma.post.delete()`).
 * - Methods will become asynchronous (returning Promises) to handle database I/O,
 *   and database-specific errors/constraints will be handled at this boundary.
 *
 * WHAT WILL REMAIN UNCHANGED:
 * - The repository interface and method signatures: findAll(), findById(id),
 *   create(fields), update(id, patch), and remove(id).
 * - The semantic return shapes and contracts:
 *   - findAll() returns an array (empty array if no records, never null).
 *   - findById(id) returns the record object or null if not found.
 *   - create(fields) returns the created record with its generated id.
 *   - update(id, patch) returns the updated record or null if not found.
 *   - remove(id) returns a boolean (true if removed, false if not found).
 * - All higher layers:
 *   - postService.js retains its business rules, validation guards, and workflow orchestration.
 *   - postController.js retains HTTP status handling, parameter parsing, and JSON response shapes.
 *   - Routes and external API contracts remain unchanged.
 */

let seedPosts = [
  { id: 1, title: 'First post', body: 'Repository boundaries protect change.', authorId: 7 },
  { id: 2, title: 'Second post', body: 'Services should speak in domain language.', authorId: 8 },
];

try {
  const postStore = require('../data/postStore');
  if (postStore && Array.isArray(postStore.posts)) {
    seedPosts = postStore.posts;
  }
} catch (_) {
  // Use default seedPosts if postStore is unavailable
}

// Storage-swap proof: internal store backed by a Map instead of an array
const posts = new Map();
seedPosts.forEach((post) => {
  posts.set(Number(post.id), { ...post });
});

let nextId = Math.max(0, ...posts.keys()) + 1;

function findAll() {
  return Array.from(posts.values()).map((post) => ({ ...post }));
}

function findById(id) {
  const post = posts.get(Number(id));
  return post ? { ...post } : null;
}

function create(fields) {
  const id = nextId++;
  const post = {
    id,
    title: fields.title,
    body: fields.body || '',
    authorId: fields.authorId,
  };
  posts.set(id, post);
  return { ...post };
}

function update(id, patch) {
  const numericId = Number(id);
  const post = posts.get(numericId);
  if (!post) return null;
  if (patch) {
    if (patch.title !== undefined) post.title = patch.title;
    if (patch.body !== undefined) post.body = patch.body;
    if (patch.authorId !== undefined) post.authorId = patch.authorId;
  }
  return { ...post };
}

function remove(id) {
  return posts.delete(Number(id));
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};
