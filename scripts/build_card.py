#!/usr/bin/env python3
"""Build a self-contained card without installing dependencies or accessing the network."""
import argparse
import base64
import html
import json
import os
from pathlib import Path
import re
import secrets
import tempfile
import textwrap

ASSETS = Path(__file__).resolve().parents[1] / 'assets'
MARKER = '<!-- Built with pop-up-birthday-card -->'
STYLES = ('party', 'garden', 'starlight')


def validate_wishes(items):
    if not isinstance(items, list) or not 1 <= len(items) <= 8:
        raise ValueError('Wishes must be a JSON array containing 1–8 objects')
    result = []
    for index, item in enumerate(items, 1):
        if not isinstance(item, dict) or set(item) - {'label', 'text', 'from', 'to'}:
            raise ValueError('Each wish supports only label, text, from and to')
        if not isinstance(item.get('text'), str) or not item['text'].strip() or len(item['text']) > 160:
            raise ValueError('Each wish needs a non-empty text of at most 160 characters')
        for field in ('label', 'from', 'to'):
            if field in item and (not isinstance(item[field], str) or not item[field].strip() or len(item[field]) > 40):
                raise ValueError(f'Wish {field} must be a non-empty string of at most 40 characters')
        wish = dict(item)  # Keep supplied words, speakers and recipients intact.
        wish.setdefault('label', wish.get('from') or f'祝福 {index}')
        result.append(wish)
    return result


def previous_config(output):
    match = re.search(r'const CONFIG=(.*?);const ASSETS=', output.read_text(encoding='utf-8'))
    if match:
        try:
            value = json.loads(match[1])
            return value if isinstance(value, dict) else {}
        except json.JSONDecodeError:
            pass
    return {}


def choose_config(args, message, lines, previous):
    if args.style == 'random':
        # Pick once for a new card; ordinary rebuilds retain its appearance.
        style = previous.get('style')
        if style not in STYLES:
            style = secrets.choice(STYLES)
    else:
        style = args.style
    if style not in STYLES:
        raise ValueError('Unknown card style')
    if args.wishes_json:
        wishes = validate_wishes(json.loads(Path(args.wishes_json).expanduser().read_text(encoding='utf-8')))
    elif previous.get('message') == message and 'wishes' in previous:
        wishes = validate_wishes(previous['wishes'])
    else:
        wishes = [
            {'label': '生日快乐', 'text': '生日快乐！愿今天充满美好的惊喜。'},
            {'label': '健康平安', 'text': '愿你健康平安，幸福常伴。'},
            {'label': '天天开心', 'text': '愿你笑口常开，天天开心。'},
        ]
    return {'message': message, 'coverLines': lines, 'musicEnabled': not args.silent,
            'style': style, 'wishes': wishes}


def embed(path, audio=False):
    path = Path(path).expanduser().resolve()
    payload = path.read_bytes()
    if not payload:
        raise ValueError(f'Empty asset: {path}')
    if payload.startswith(b'\x89PNG\r\n\x1a\n') and not audio:
        mime = 'image/png'
    elif payload.startswith(b'\xff\xd8\xff') and not audio:
        mime = 'image/jpeg'
    elif payload[:4] == b'RIFF' and payload[8:12] == b'WEBP' and not audio:
        mime = 'image/webp'
    elif audio and (payload.startswith(b'ID3') or payload[:2] in (b'\xff\xfb', b'\xff\xf3', b'\xff\xf2')):
        mime = 'audio/mpeg'
    elif audio and payload[:4] == b'RIFF' and payload[8:12] == b'WAVE':
        mime = 'audio/wav'
    else:
        raise ValueError(f'Unsupported asset: {path}; use PNG/JPEG/WebP images or MP3/WAV audio')
    return 'data:' + mime + ';base64,' + base64.b64encode(payload).decode('ascii')


def cover_lines(message):
    match = re.fullmatch(r'Happy Birthday(?:\s+(.+))?', message)
    if match:
        return ['Happy', 'Birthday'] + ([match[1]] if match[1] else [])
    return textwrap.wrap(message, width=max(12, (len(message) + 2) // 3)) or [message]


def build(args):
    message = args.message.strip()
    if not message or len(message) > 160:
        raise ValueError('Provide an exact greeting of 1–160 characters; longer copy needs a custom layout')
    lines = args.cover_line or cover_lines(message)
    if not 1 <= len(lines) <= 4 or any(not line.strip() for line in lines):
        raise ValueError('Use 1–4 non-empty cover lines')
    if re.sub(r'\s+', '', ''.join(lines)) != re.sub(r'\s+', '', message):
        raise ValueError('Cover lines must preserve the exact greeting characters')
    output = Path(args.output).expanduser().absolute()
    if output.is_symlink():
        raise ValueError('Refusing to replace a symbolic link')
    previous = {}
    if output.exists():
        if not args.overwrite or MARKER not in output.read_text(encoding='utf-8')[:200]:
            raise ValueError('Output exists; --overwrite only replaces a card previously built by this helper')
        previous = previous_config(output)
    settings = choose_config(args, message, lines, previous)
    config = json.dumps(settings, ensure_ascii=True)
    config = config.replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026')
    replacements = {
        '/*MESSAGE_HTML*/': html.escape(message),
        '/*CONFIG_DATA*/': config,
        '/*FOREGROUND_DATA*/': embed(args.foreground),
        '/*BACKGROUND_DATA*/': embed(args.background),
        '/*MUSIC_DATA*/': '' if args.silent else embed(args.music or ASSETS / 'music-box.mp3', audio=True),
        '/*THREE_LIBRARY*/': (ASSETS / 'three.min.js').read_text(),
        '/*THREE_LICENSE*/': (ASSETS / 'THREE-LICENSE.txt').read_text(),
        '/*APP_CODE*/': (ASSETS / 'card.js').read_text()
            .replace('/*STYLE_DRAWINGS*/', (ASSETS / 'style-drawings.js').read_text())
            .replace('/*WISH_INTERACTION*/', (ASSETS / 'wishes.js').read_text()),
    }
    # One pass: user text cannot become another template substitution.
    template = (ASSETS / 'page.html').read_text()
    token = re.compile('|'.join(re.escape(key) for key in replacements))
    document = token.sub(lambda match: replacements[match[0]], template)
    output.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary = tempfile.mkstemp(prefix='.birthday-', suffix='.html', dir=output.parent)
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as handle:
            handle.write(document)
        os.chmod(temporary, 0o644)
        if args.overwrite and output.exists():
            if output.is_symlink() or MARKER not in output.read_text(encoding='utf-8')[:200]:
                raise ValueError('Destination changed while building; refusing to overwrite')
            os.replace(temporary, output)
        else:
            os.link(temporary, output)  # Atomic publication; refuses existing files.
        print(f'Built {output} ({output.stat().st_size:,} bytes); style={settings["style"]}; wishes={len(settings["wishes"])}; music={not args.silent}')
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--foreground', required=True, help='Transparent person/group artwork')
    parser.add_argument('--background', required=True, help='Separate scenery artwork')
    parser.add_argument('--message', required=True, help='Exact greeting, preserved in HTML and printed textures')
    parser.add_argument('--style', choices=('random',) + STYLES, default='random',
                        help='Default: randomly select one style once; existing cards keep their style when rebuilt')
    parser.add_argument('--wishes-json', help='JSON file of exact custom wishes; replaces generic choices, with optional from/to')
    parser.add_argument('--cover-line', action='append', help='Optional repeated lines; preserve all greeting characters')
    audio = parser.add_mutually_exclusive_group()
    audio.add_argument('--music', help='Optional custom MP3/WAV; otherwise use bundled music-box arrangement')
    audio.add_argument('--silent', action='store_true', help='Build without audio and hide the sound control')
    parser.add_argument('--output', required=True, help='New standalone HTML path')
    parser.add_argument('--overwrite', action='store_true', help='Replace only a helper-built card')
    args = parser.parse_args()
    try:
        build(args)
    except (ValueError, OSError) as error:
        parser.exit(1, f'Error: {error}\n')


if __name__ == '__main__':
    main()
