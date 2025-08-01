export function extractMessages(rawHistory: string[]): { role: 'user' | 'assistant', content: string }[] {
  return rawHistory
    .slice(-8)
    .map(line => {
      if (line.startsWith('SIMDAIuser: ')) {
        return { role: 'user', content: line.replace('SIMDAIuser: ', '') };
      }
      if (line.startsWith('SIMDAIbot: ')) {
        return { role: 'assistant', content: line.replace('SIMDAIbot: ', '') };
      }
      return null;
    })
    .filter((msg): msg is { role: 'user' | 'assistant'; content: string } => msg !== null);
}
