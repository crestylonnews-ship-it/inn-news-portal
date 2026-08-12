from __future__ import annotations

import argparse
from pathlib import Path
from typing import Iterable

import opencc


ROOT = Path(__file__).resolve().parents[1]
ARTICLES_DIR = ROOT / "content" / "articles"
CHARACTER_TABLE = Path(opencc.__file__).resolve().parent / "dictionary" / "STCharacters.txt"


def article_files() -> Iterable[Path]:
    return sorted(ARTICLES_DIR.glob("*.md"))


def load_character_map() -> dict[int, str]:
    mapping: dict[int, str] = {}
    for line in CHARACTER_TABLE.read_text(encoding="utf-8").splitlines():
        if not line.strip() or line.startswith("#"):
            continue
        columns = line.split("\t")
        if len(columns) < 2:
            continue
        simplified = columns[0].strip()
        traditional = columns[1].split()[0].strip()
        if len(simplified) == 1 and len(traditional) == 1:
            mapping[ord(simplified)] = traditional
    return mapping


def main() -> int:
    parser = argparse.ArgumentParser(description="Convert article Markdown from Simplified Chinese characters to Traditional Chinese characters.")
    parser.add_argument("--dry-run", action="store_true", help="Report changes without writing files.")
    args = parser.parse_args()

    character_map = load_character_map()
    changed: list[tuple[Path, str, str]] = []

    for path in article_files():
        original = path.read_text(encoding="utf-8")
        converted = original.translate(character_map)
        if converted != original:
            changed.append((path, original, converted))
            if not args.dry_run:
                path.write_text(converted, encoding="utf-8", newline="")

    print(f"article_files={len(list(article_files()))}")
    print(f"mapped_characters={len(character_map)}")
    print(f"changed_files={len(changed)}")
    print(f"mode={'dry-run' if args.dry_run else 'write'}")
    for path, original, converted in changed[:12]:
        print(f"changed={path.relative_to(ROOT)} chars={len(original)}->{len(converted)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
