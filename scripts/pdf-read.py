"""
Local research helper for reading the Ordem Paranormal rulebook PDFs
(D:\\Livros OP\\*.pdf) page by page, built while cataloging Ameaças (see
docs/threats-audit.md). Uses PyMuPDF (fitz), already installed on this
machine. Output is for reading and hand-writing original mechanical
summaries only -- never republished verbatim. No book text or art is
committed to the repository; this script and its output stay local.

Why this exists instead of the Read tool: these PDFs exceed the Read
tool's 100MB text-extraction limit, even one page at a time. PyMuPDF reads
them directly from disk instead.

Usage:
  python scripts/pdf-read.py find <pdf> <termo> [termo2 ...]
      Busca um termo (case-insensitive) em todas as páginas; imprime o
      número de página (1-based, o mesmo que page/render/blocks usam).

  python scripts/pdf-read.py text <pdf> <page1> [page2 ...]
      Texto corrido de cada página, na ordem de leitura do PyMuPDF. Bom
      para parágrafos de flavor text; a barra lateral de estatísticas de
      uma ameaça normalmente sai emendada com o texto ao lado -- use
      "render" para conferir esses casos visualmente.

  python scripts/pdf-read.py blocks <pdf> <page>
      Blocos de texto com a caixa delimitadora (x/y). Útil para entender
      o layout de duas colunas antes de decidir se "text" já basta.

  python scripts/pdf-read.py render <pdf> <page> <out.png> [zoom]
      Renderiza a página como PNG (zoom padrão 2.5, suficiente para ler
      números pequenos). Abra o PNG com a ferramenta Read -- é a forma
      confiável de ler a ficha de uma ameaça: alguns valores (ex.: os
      bônus de Reflexos/Vontade/Iniciativa) são ícones de dado (d20) sem
      contagem de dados na frente quando o bônus é +0, e a extração de
      texto por si só não deixa isso claro.

Observação sobre numeração de página: o número que este script usa é o
índice do PDF (1-based), NÃO o número impresso no rodapé da página. Para
o livro base v1.3, página impressa = página do PDF - 9 (ache o offset de
novo se usar outro arquivo: renderize uma página, leia o número no
rodapé e compare).
"""
import sys
import fitz  # pymupdf

# Windows' console codepage (cp1252) can't encode the private-use-area glyphs
# this book uses for its bullet/dice icons (e.g. U+F077); force UTF-8 so
# printing or redirecting to a file doesn't crash on them.
sys.stdout.reconfigure(encoding="utf-8")

def cmd_find(pdf_path, terms):
    doc = fitz.open(pdf_path)
    needles = [t.lower() for t in terms]
    for i in range(len(doc)):
        text = doc[i].get_text("text").lower()
        if all(n in text for n in needles):
            preview = doc[i].get_text("text").strip().replace("\n", " | ")[:70]
            print(f"{i + 1}\t{preview}")
    doc.close()

def cmd_text(pdf_path, pages):
    doc = fitz.open(pdf_path)
    for p in pages:
        page = doc[p - 1]
        print(f"\n===== PÁGINA {p} =====")
        print(page.get_text("text"))
    doc.close()

def cmd_blocks(pdf_path, page_num):
    doc = fitz.open(pdf_path)
    page = doc[page_num - 1]
    blocks = page.get_text("blocks")
    blocks.sort(key=lambda b: (round(b[1] / 5), b[0]))
    for b in blocks:
        x0, y0, x1, y1, txt, *_ = b
        flat = txt.replace("\n", " | ").strip()
        print(f"x=[{x0:6.1f},{x1:6.1f}] y=[{y0:6.1f},{y1:6.1f}]  {flat}")
    doc.close()

def cmd_render(pdf_path, page_num, out_path, zoom=2.5):
    doc = fitz.open(pdf_path)
    page = doc[page_num - 1]
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom))
    pix.save(out_path)
    print(f"saved {out_path} ({pix.width}x{pix.height})")
    doc.close()

if __name__ == "__main__":
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(1)
    mode = args[0]
    if mode == "find":
        cmd_find(args[1], args[2:])
    elif mode == "text":
        cmd_text(args[1], [int(a) for a in args[2:]])
    elif mode == "blocks":
        cmd_blocks(args[1], int(args[2]))
    elif mode == "render":
        zoom = float(args[4]) if len(args) > 4 else 2.5
        cmd_render(args[1], int(args[2]), args[3], zoom)
    else:
        print(__doc__)
        sys.exit(1)
