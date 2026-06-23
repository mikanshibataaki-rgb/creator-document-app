import argparse
from datetime import date, timedelta
from pathlib import Path

from config import PHOTO_FOLDER_PATH
from category import detect_category
from csv_exporter import export_posts_to_csv
from photo_reader import find_photos
from scheduler import generate_schedule_dates
from text_generator import (
    generate_hashtags,
    generate_instagram_text,
    generate_threads_text,
    generate_x_text,
)


BASE_DIR = Path(__file__).resolve().parent
LOCAL_PHOTO_FOLDER = BASE_DIR / "photos"
DEFAULT_OUTPUT_PATH = BASE_DIR / "output" / "posts.csv"


def get_default_photo_folder() -> Path:
    if PHOTO_FOLDER_PATH.strip():
        return Path(PHOTO_FOLDER_PATH).expanduser()

    return LOCAL_PHOTO_FOLDER


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="岐阜スタジオ向けSNS投稿案CSVを作成します。"
    )
    parser.add_argument(
        "--photo-folder",
        type=Path,
        default=get_default_photo_folder(),
        help="写真フォルダの場所を指定します。",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT_PATH,
        help="CSVの出力先を指定します。",
    )
    parser.add_argument(
        "--start-date",
        type=date.fromisoformat,
        default=date.today() + timedelta(days=1),
        help="最初の投稿予定日です。例: 2026-06-11",
    )
    parser.add_argument(
        "--interval-days",
        type=int,
        default=1,
        help="投稿予定日の間隔です。1なら毎日、2なら2日に1回です。",
    )
    return parser.parse_args()


def build_post_rows(photo_folder: Path, start_date: date, interval_days: int) -> list[dict[str, str]]:
    photos = find_photos(photo_folder)
    schedule_dates = generate_schedule_dates(len(photos), start_date, interval_days)

    rows = []
    for photo_path, scheduled_date in zip(photos, schedule_dates):
        category = detect_category(photo_path)
        rows.append(
            {
                "photo_path": str(photo_path),
                "category": category,
                "scheduled_date": scheduled_date.isoformat(),
                "instagram_text": generate_instagram_text(category, photo_path),
                "threads_text": generate_threads_text(category, photo_path),
                "x_text": generate_x_text(category, photo_path),
                "hashtags": generate_hashtags(category),
            }
        )

    return rows


def main() -> None:
    args = parse_args()

    if args.interval_days < 1:
        raise ValueError("--interval-days は1以上にしてください。")

    if not args.photo_folder.exists():
        print("写真フォルダが見つかりませんでした。")
        print(f"指定されている場所: {args.photo_folder}")
        print("Google Driveの同期フォルダの場所を確認して、config.py の PHOTO_FOLDER_PATH を直してください。")
        return

    rows = build_post_rows(args.photo_folder, args.start_date, args.interval_days)
    export_posts_to_csv(rows, args.output)

    print("CSVを作成しました。")
    print(f"写真数: {len(rows)}")
    print(f"写真フォルダ: {args.photo_folder}")
    print(f"出力先: {args.output}")

    if not rows:
        print("写真が見つかりませんでした。photosフォルダにjpg/png/webp/heicなどを入れてください。")


if __name__ == "__main__":
    main()
