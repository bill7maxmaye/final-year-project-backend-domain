export function extractHashtags(text: string): string[] {
  const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
  const matches = text.matchAll(hashtagRegex);
  const hashtags: string[] = [];
  for (const match of matches) {
    if (match[1]) {
      hashtags.push(match[1]);
    }
  }
  return hashtags;
}
