import re


def to_filename(name: str):
    name = re.sub(r"[^\w\s-]|_", "", name)
    name = re.sub(r"\s+", "-", name)
    return name.lower()
