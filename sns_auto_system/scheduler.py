from datetime import date, timedelta


def generate_schedule_dates(count: int, start_date: date, interval_days: int) -> list[date]:
    """投稿予定日を指定日から一定間隔で作ります。"""
    return [start_date + timedelta(days=index * interval_days) for index in range(count)]


def generate_schedule_dates_by_daily_count(
    count: int, start_date: date, posts_per_day: int
) -> list[date]:
    """1日に作る投稿数に合わせて投稿予定日を割り振ります。"""
    if posts_per_day < 1:
        raise ValueError("posts_per_day は1以上にしてください。")

    return [start_date + timedelta(days=index // posts_per_day) for index in range(count)]
