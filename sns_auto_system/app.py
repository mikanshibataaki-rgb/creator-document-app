from datetime import date
import os
from pathlib import Path

import streamlit as st

from category import detect_category
from config import PHOTO_FOLDER_PATH
from csv_exporter import CSV_COLUMNS, export_posts_to_csv, make_csv_bytes
from photo_reader import find_photos
from scheduler import generate_schedule_dates_by_daily_count
from text_generator import (
    generate_hashtags,
    generate_instagram_text,
    generate_threads_text,
    generate_x_text,
)


BASE_DIR = Path(__file__).resolve().parent
LOCAL_PHOTO_FOLDER = BASE_DIR / "photos"
OUTPUT_PATH = BASE_DIR / "output" / "posts_gui.csv"
PLATFORM_COLUMNS = {
    "Instagram": "instagram_text",
    "Threads": "threads_text",
    "X": "x_text",
}


def get_initial_photo_folder() -> str:
    if PHOTO_FOLDER_PATH.strip():
        return PHOTO_FOLDER_PATH

    return str(LOCAL_PHOTO_FOLDER)


def find_google_drive_candidates(folder_name: str = "岐阜スタジオSNS") -> list[Path]:
    cloud_storage = Path.home() / "Library" / "CloudStorage"
    if not cloud_storage.exists():
        return []

    candidates = []
    for google_drive_root in cloud_storage.glob("GoogleDrive-*"):
        for path in walk_limited_depth(google_drive_root, max_depth=6):
            if path.name == folder_name and path.is_dir():
                candidates.append(path)
            if len(candidates) >= 10:
                return candidates

    return candidates


def walk_limited_depth(root: Path, max_depth: int) -> list[Path]:
    paths = []
    root_depth = len(root.parts)

    for current_root, dir_names, _file_names in os.walk(root):
        current_path = Path(current_root)
        current_depth = len(current_path.parts) - root_depth
        if current_depth >= max_depth:
            dir_names[:] = []
        paths.append(current_path)

    return paths


def build_rows(
    photo_folder: Path,
    start_date: date,
    posts_per_day: int,
) -> list[dict[str, str]]:
    photos = find_photos(photo_folder)
    schedule_dates = generate_schedule_dates_by_daily_count(
        len(photos), start_date, posts_per_day
    )

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


def selected_columns(platforms: list[str]) -> tuple[str, ...]:
    columns = ["photo_path", "category", "scheduled_date", "hashtags"]
    columns.extend(PLATFORM_COLUMNS[platform] for platform in platforms)
    return tuple(column for column in CSV_COLUMNS if column in columns)


def filter_rows(rows: list[dict[str, str]], columns: tuple[str, ...]) -> list[dict[str, str]]:
    return [{column: row[column] for column in columns} for row in rows]


def main() -> None:
    st.set_page_config(
        page_title="岐阜スタジオSNS司令室",
        layout="wide",
    )

    st.title("岐阜スタジオSNS司令室")
    st.caption("写真フォルダからSNS投稿案を作り、CSVとして保存します。自動投稿はまだ行いません。")

    with st.expander("最初に読むメモ", expanded=True):
        st.write(
            "Google Driveで同期されているフォルダは、Macの中の普通のフォルダとして読み込めます。"
            "Finderで「岐阜スタジオSNS」フォルダのパスをコピーして、下の入力欄に貼り付けてください。"
        )

    st.subheader("1. 写真フォルダ")
    photo_folder_text = st.text_input(
        "写真フォルダのパス",
        value=get_initial_photo_folder(),
        help="例: /Users/ユーザー名/Library/CloudStorage/GoogleDrive-メールアドレス/マイドライブ/岐阜スタジオSNS",
    )

    if st.button("Google Drive内の「岐阜スタジオSNS」候補を探す"):
        candidates = find_google_drive_candidates()
        if candidates:
            st.success("候補が見つかりました。使いたいパスをコピーして、上の入力欄に貼り付けてください。")
            for candidate in candidates:
                st.code(str(candidate), language=None)
        else:
            st.warning("候補が見つかりませんでした。Finderでパスをコピーして入力してください。")

    st.subheader("2. 投稿設定")
    col_start, col_count = st.columns(2)
    with col_start:
        start_date = st.date_input("投稿開始日", value=date.today())
    with col_count:
        posts_per_day = st.number_input(
            "1日に作る投稿数",
            min_value=1,
            max_value=20,
            value=1,
            step=1,
        )

    st.subheader("3. 作るSNS投稿文")
    col_ig, col_threads, col_x = st.columns(3)
    with col_ig:
        use_instagram = st.checkbox("Instagram", value=True)
    with col_threads:
        use_threads = st.checkbox("Threads", value=True)
    with col_x:
        use_x = st.checkbox("X", value=True)

    platforms = []
    if use_instagram:
        platforms.append("Instagram")
    if use_threads:
        platforms.append("Threads")
    if use_x:
        platforms.append("X")

    if st.button("投稿案を生成", type="primary"):
        photo_folder = Path(photo_folder_text).expanduser()

        if not platforms:
            st.error("Instagram / Threads / X のどれか1つ以上にチェックを入れてください。")
        elif not photo_folder.exists():
            st.error("写真フォルダが見つかりません。パスが正しいか確認してください。")
            st.code(str(photo_folder), language=None)
        else:
            rows = build_rows(photo_folder, start_date, int(posts_per_day))
            st.session_state["generated_rows"] = rows
            st.session_state["selected_platforms"] = platforms

            if rows:
                st.success(f"{len(rows)}件の投稿案を生成しました。")
            else:
                st.warning("写真が見つかりませんでした。jpg / jpeg / png / webp / heic の写真を入れてください。")

    rows = st.session_state.get("generated_rows", [])
    saved_platforms = st.session_state.get("selected_platforms", platforms)

    if rows:
        columns = selected_columns(saved_platforms)
        visible_rows = filter_rows(rows, columns)

        st.subheader("4. 生成結果")
        st.dataframe(visible_rows, use_container_width=True, hide_index=True)

        st.subheader("5. CSV保存")
        col_save, col_download = st.columns(2)
        with col_save:
            if st.button("CSVをoutputフォルダに保存"):
                export_posts_to_csv(visible_rows, OUTPUT_PATH, columns)
                st.success(f"保存しました: {OUTPUT_PATH}")
        with col_download:
            st.download_button(
                "CSVをダウンロード",
                data=make_csv_bytes(visible_rows, columns),
                file_name="gifu_studio_sns_posts.csv",
                mime="text/csv",
            )


if __name__ == "__main__":
    main()
