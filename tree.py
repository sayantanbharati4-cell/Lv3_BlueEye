from pathlib import Path

ROOT = Path(".")

IGNORE_DIRS = {
    ".git",
    ".next",
    "node_modules",
    ".vercel",
    ".vscode",
    ".idea",
    ".turbo",
    ".cache",
    "__pycache__",
    "dist",
    "build",
    "coverage",
    ".pytest_cache",
}

IGNORE_FILES = {
    ".DS_Store",
    "Thumbs.db",
}

lines = []


def tree(path: Path, prefix=""):
    entries = sorted(
        [
            p
            for p in path.iterdir()
            if p.name not in IGNORE_DIRS
            and p.name not in IGNORE_FILES
        ],
        key=lambda p: (p.is_file(), p.name.lower()),
    )

    for i, entry in enumerate(entries):
        connector = "└── " if i == len(entries) - 1 else "├── "
        lines.append(prefix + connector + entry.name)

        if entry.is_dir():
            extension = "    " if i == len(entries) - 1 else "│   "
            tree(entry, prefix + extension)


lines.append(ROOT.resolve().name)
tree(ROOT)

output_file = ROOT / "tree.txt"
output_file.write_text("\n".join(lines), encoding="utf-8")

print(f"Tree exported to: {output_file.resolve()}")