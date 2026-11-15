"""Convert .docx files to Markdown-ish text, preserving heading levels, lists and tables.

Usage: python docx2md.py <src_dir> <out_dir>
"""
import sys
import os
from docx import Document
from docx.table import Table
from docx.text.paragraph import Paragraph


def iter_block_items(doc):
    body = doc.element.body
    for child in body.iterchildren():
        tag = child.tag.rsplit('}', 1)[-1]
        if tag == 'p':
            yield Paragraph(child, doc)
        elif tag == 'tbl':
            yield Table(child, doc)


def para_to_md(p):
    text = p.text.strip()
    if not text:
        return ''
    style = (p.style.name or '').lower() if p.style is not None else ''
    if style.startswith('heading'):
        try:
            level = int(style.split()[-1])
        except ValueError:
            level = 1
        return '#' * min(level, 6) + ' ' + text
    if style == 'title':
        return '# ' + text
    if 'list' in style or p._p.pPr is not None and p._p.pPr.numPr is not None:
        ilvl = 0
        try:
            if p._p.pPr.numPr is not None and p._p.pPr.numPr.ilvl is not None:
                ilvl = int(p._p.pPr.numPr.ilvl.val)
        except Exception:
            pass
        return '  ' * ilvl + '- ' + text
    return text


def table_to_md(t):
    rows = []
    for r in t.rows:
        cells = []
        seen = set()
        for c in r.cells:
            if id(c._tc) in seen:
                continue
            seen.add(id(c._tc))
            cells.append(' '.join(c.text.split()).replace('|', '\\|'))
        rows.append(cells)
    if not rows:
        return ''
    width = max(len(r) for r in rows)
    out = []
    for i, r in enumerate(rows):
        r = r + [''] * (width - len(r))
        out.append('| ' + ' | '.join(r) + ' |')
        if i == 0:
            out.append('|' + '---|' * width)
    return '\n'.join(out)


def convert(src, dst):
    doc = Document(src)
    parts = []
    for block in iter_block_items(doc):
        if isinstance(block, Paragraph):
            md = para_to_md(block)
        else:
            md = table_to_md(block)
        if md:
            parts.append(md)
    text = '\n\n'.join(parts) + '\n'
    with open(dst, 'w', encoding='utf-8') as f:
        f.write(text)
    return len(text)


def main():
    src_dir, out_dir = sys.argv[1], sys.argv[2]
    os.makedirs(out_dir, exist_ok=True)
    for name in sorted(os.listdir(src_dir)):
        if not name.lower().endswith('.docx') or name.startswith('~$'):
            continue
        dst = os.path.join(out_dir, os.path.splitext(name)[0] + '.md')
        n = convert(os.path.join(src_dir, name), dst)
        print(f'{n:>8}  {name}')


if __name__ == '__main__':
    main()
