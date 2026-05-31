import csv
import io

def parse_csv(file, separator=",", skip_rows=0):
    if not file:
        return []

    try:
        stream = io.TextIOWrapper(file.stream, encoding="utf-8")
        reader = csv.reader(stream, delimiter=separator)
        rows = list(reader)
        return rows[skip_rows:]

    except Exception as e:
        print(f"CSV parsing error: {e}")
        return []