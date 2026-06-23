from pathlib import Path

from config import IMAGE_EXTENSIONS


def find_photos(photo_folder: Path) -> list[Path]:
    """指定フォルダの中から写真ファイルを探します。"""
    if not photo_folder.exists():
        return []

    photos = []
    for path in photo_folder.rglob("*"):
        if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS:
            photos.append(path)

    return sorted(photos)
