function replaceNewlineWithBr(text: string) {
  if (!text) return '';
  return text.replace(/\n/g, '<br>');
}

function removeInlineStyles(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;

  // Đệ quy loại bỏ thuộc tính style trong tất cả node con
  function removeStyles(element: Element) {
    element.removeAttribute('style');
    for (const child of Array.from(element.children)) {
      removeStyles(child);
    }
  }

  for (const el of Array.from(div.children)) {
    removeStyles(el);
  }

  return div.innerHTML;
}

export { replaceNewlineWithBr, removeInlineStyles };
