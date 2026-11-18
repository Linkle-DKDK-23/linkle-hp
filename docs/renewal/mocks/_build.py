"""d-ring の HTML から e-line / f-tile を生成する（内容は共通、見た目だけ切替）。"""
import pathlib, re
root = pathlib.Path(__file__).parent
FONT = {
 'line': 'family=Noto+Sans+JP:wght@300;400;500&family=Jost:wght@400;500;600',
 'tile': 'family=LINE+Seed+JP:wght@400;700',
}
for v, d in (('line', 'e-line'), ('tile', 'f-tile')):
    (root / d).mkdir(exist_ok=True)
    for f in (root / 'd-ring').glob('*.html'):
        s = f.read_text()
        s = s.replace('assets/site.', '../d-ring/assets/site.')
        s = re.sub(r'<body data-page="(\w+)"', rf'<body data-page="\1" data-variant="{v}"', s)
        s = re.sub(r'css2\?family=[^"]+&display=swap', 'css2?' + FONT[v] + '&display=swap', s)
        s = re.sub(r'<script src="https://cdnjs[^\n]+\n', '', s)
        s = s.replace('<script src="../d-ring/assets/fx3d.js"></script>\n', '').replace('<script src="assets/fx3d.js"></script>\n', '')
        (root / d / f.name).write_text(s)
print('built')
