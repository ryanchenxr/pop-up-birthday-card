"""Offline regression checks for style selection, attribution and portable output."""
import argparse
import contextlib
import importlib.util
import io
import json
from pathlib import Path
import re
import struct
import sys
import tempfile
import unittest
from unittest.mock import patch
import zlib

sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location('build_card', Path(__file__).resolve().parents[1] / 'scripts/build_card.py')
card = importlib.util.module_from_spec(spec)
spec.loader.exec_module(card)


def png():
    def chunk(kind, data):
        return struct.pack('>I', len(data)) + kind + data + struct.pack('>I', zlib.crc32(kind + data) & 0xffffffff)
    return (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', 1, 1, 8, 6, 0, 0, 0))
            + chunk(b'IDAT', zlib.compress(b'\x00\x55\xaa\x66\xff')) + chunk(b'IEND', b''))


class CardBuildTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.image = self.root / 'fixture.png'
        self.image.write_bytes(png())
        self.output = self.root / 'card.html'

    def tearDown(self):
        self.temp.cleanup()

    def build(self, **changes):
        options = dict(foreground=str(self.image), background=str(self.image), message='Happy Birthday to Alex',
                       cover_line=None, music=None, silent=True, output=str(self.output), overwrite=False,
                       style='random', wishes_json=None)
        options.update(changes)
        with contextlib.redirect_stdout(io.StringIO()):
            card.build(argparse.Namespace(**options))
        self.document = self.output.read_text()
        return json.loads(re.search(r'const CONFIG=(.*?);const ASSETS=', self.document)[1])

    def wishes(self, items):
        path = self.root / 'wishes.json'
        path.write_text(json.dumps(items, ensure_ascii=False))
        return str(path)

    def test_default_picks_one_style(self):
        with patch.object(card.secrets, 'choice', return_value='garden') as choice:
            cfg = self.build()
        choice.assert_called_once_with(card.STYLES)
        self.assertEqual(cfg['style'], 'garden')
        self.assertEqual(len(list(self.root.glob('*.html'))), 1)
        self.assertNotIn('比较三种封面', self.document)

    def test_explicit_style_does_not_draw_randomly(self):
        with patch.object(card.secrets, 'choice', side_effect=AssertionError('must not randomize')):
            self.assertEqual(self.build(style='starlight')['style'], 'starlight')

    def test_rebuild_preserves_style(self):
        self.build(style='garden')
        with patch.object(card.secrets, 'choice', side_effect=AssertionError('must retain style')):
            self.assertEqual(self.build(overwrite=True)['style'], 'garden')
        self.assertEqual(self.build(style='party', overwrite=True)['style'], 'party')

    def test_generic_wishes_do_not_invent_people(self):
        cfg = self.build()
        self.assertEqual(len(cfg['wishes']), 3)
        self.assertTrue(all(set(w) == {'label', 'text'} for w in cfg['wishes']))
        self.assertNotIn('Grandma', json.dumps(cfg['wishes']))

    def test_personal_wishes_replace_defaults_exactly(self):
        items = [{'from': '小明', 'to': '奶奶', 'text': '生日快乐！'},
                 {'label': '小雨的祝福', 'from': '小雨', 'to': '奶奶', 'text': '愿您平安。'}]
        cfg = self.build(wishes_json=self.wishes(items))
        self.assertEqual(len(cfg['wishes']), 2)
        self.assertEqual(cfg['wishes'][0], dict(items[0], label='小明'))
        self.assertEqual(cfg['wishes'][1], items[1])

    def test_rebuild_retains_custom_wishes_but_new_recipient_does_not(self):
        cfg = self.build(wishes_json=self.wishes([{'from': 'Mina', 'to': 'Alex', 'text': 'Have a lovely day!'}]))
        self.assertEqual(self.build(overwrite=True)['wishes'], cfg['wishes'])
        changed = self.build(message='Happy Birthday to Sam', overwrite=True)
        self.assertTrue(all('from' not in w and 'to' not in w for w in changed['wishes']))

    def test_missing_sender_uses_neutral_label(self):
        cfg = self.build(wishes_json=self.wishes([{'text': '愿每一天都开心。'}]))
        self.assertEqual(cfg['wishes'][0]['label'], '祝福 1')
        self.assertNotIn('from', cfg['wishes'][0])

    def test_custom_text_cannot_close_script(self):
        message = 'Happy Birthday </script> & "A"'
        wish = {'from': '<script>', 'to': 'A&B', 'text': '</script><script>alert(1)</script>'}
        cfg = self.build(message=message, wishes_json=self.wishes([wish]))
        self.assertEqual(cfg['message'], message)
        self.assertEqual(cfg['wishes'][0]['text'], wish['text'])
        self.assertEqual(self.document.lower().count('</script>'), 3)

    def test_invalid_wishes_leave_existing_file_unchanged(self):
        self.build()
        before = self.output.read_bytes()
        for invalid in ([], {'text': 'not an array'}, [{'text': ''}], [{'text': 'ok', 'from': 42}]):
            with self.subTest(invalid=invalid), self.assertRaises(ValueError):
                self.build(overwrite=True, wishes_json=self.wishes(invalid))
            self.assertEqual(self.output.read_bytes(), before)

    def test_no_clobber_foreign_or_symlink(self):
        self.output.write_text('unrelated')
        with self.assertRaises(ValueError):
            self.build(overwrite=True)
        self.assertEqual(self.output.read_text(), 'unrelated')
        link = self.root / 'link.html'
        link.symlink_to(self.output)
        with self.assertRaises(ValueError):
            self.build(output=str(link), overwrite=True)


if __name__ == '__main__':
    unittest.main()
