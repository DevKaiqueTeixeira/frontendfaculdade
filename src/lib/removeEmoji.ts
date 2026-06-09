const emojiPattern = /[\p{Extended_Pictographic}\u200D\uFE0F]/gu;

export function removeEmoji(value: string) {
  return value.replace(emojiPattern, "");
}
