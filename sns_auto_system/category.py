from pathlib import Path

from config import CATEGORY_KEYWORDS


def detect_category(photo_path: Path) -> str:
    """写真ファイルの親フォルダ名からカテゴリを判定します。"""
    folder_names = [part.lower() for part in photo_path.parent.parts]

    for category, keywords in CATEGORY_KEYWORDS.items():
        for folder_name in folder_names:
            if category.lower() in folder_name:
                return category
            if any(keyword.lower() in folder_name for keyword in keywords):
                return category

    return "未分類"
