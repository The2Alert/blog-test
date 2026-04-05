import MarkdownItAsync from 'markdown-it-async';

export class MarkdownLib {
  private readonly md: ReturnType<typeof MarkdownItAsync>;

  constructor() {
    this.md = MarkdownItAsync({
      html: false,
      linkify: true,
      typographer: true
    });
  }

  public render(src: string): Promise<string> {
    return this.md.renderAsync(src);
  }
}
