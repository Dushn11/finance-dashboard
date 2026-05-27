import csv
import io


def parse_csv(file):
    if not file:
        return []

    try:
        stream = io.TextIOWrapper(file.stream, encoding="utf-8")
        first_line = stream.readline()

        stream.seek(0)

        if "Amount" in first_line:
            reader = csv.DictReader(stream)
            return [row for row in reader]

        else:
            reader = csv.reader(stream)
            return [row for row in reader]

    except Exception as e:
        print(f"CSV parsing error: {e}")
        return []