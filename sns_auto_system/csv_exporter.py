import csv
import io
from pathlib import Path


CSV_COLUMNS = (
    "photo_path",
    "category",
    "scheduled_date",
    "instagram_text",
    "threads_text",
    "x_text",
    "hashtags",
)


def export_posts_to_csv(
    rows: list[dict[str, str]],
    output_path: Path,
    columns: tuple[str, ...] = CSV_COLUMNS,
) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with output_path.open("w", newline="", encoding="utf-8-sig") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=columns)
        writer.writeheader()
        writer.writerows(rows)


def make_csv_bytes(rows: list[dict[str, str]], columns: tuple[str, ...] = CSV_COLUMNS) -> bytes:
    """Streamlitのダウンロードボタン用にCSVデータを作ります。"""
    csv_text = io.StringIO()
    writer = csv.DictWriter(csv_text, fieldnames=columns)
    writer.writeheader()
    writer.writerows(rows)
    return csv_text.getvalue().encode("utf-8-sig")
