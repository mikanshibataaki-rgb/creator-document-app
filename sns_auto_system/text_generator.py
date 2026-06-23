from pathlib import Path

from config import BASE_HASHTAGS, CATEGORY_HASHTAGS, CATEGORY_MESSAGES, STUDIO


def generate_instagram_text(category: str, photo_path: Path) -> str:
    category_message = CATEGORY_MESSAGES.get(category, CATEGORY_MESSAGES["未分類"])

    return (
        f"{STUDIO.location}の{STUDIO.name}より。\n\n"
        f"{category_message}\n"
        "写真の雰囲気や光の入り方を見ながら、ポートレート、コスプレ、商用撮影まで幅広くご相談いただけます。\n\n"
        f"{STUDIO.reservation_note}"
    )


def generate_threads_text(category: str, photo_path: Path) -> str:
    category_message = CATEGORY_MESSAGES.get(category, CATEGORY_MESSAGES["未分類"])

    return (
        f"{STUDIO.name}の{category}まわりを少しご紹介します。\n"
        f"{category_message}\n"
        "撮りたい雰囲気に合わせて、光や場所の使い方を一緒に考えられます。"
    )


def generate_x_text(category: str, photo_path: Path) -> str:
    category_message = CATEGORY_MESSAGES.get(category, CATEGORY_MESSAGES["未分類"])

    return (
        f"岐阜県羽島市の{STUDIO.name}。\n"
        f"{category_message}\n"
        "予約はプロフィールリンクから。"
    )


def generate_hashtags(category: str) -> str:
    category_tags = CATEGORY_HASHTAGS.get(category, CATEGORY_HASHTAGS["未分類"])
    hashtags = list(BASE_HASHTAGS) + list(category_tags)
    return " ".join(dict.fromkeys(hashtags))
