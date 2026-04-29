import csv
import io

def parse_csv(file):
    if not file:
        return []
    try:
        stream=io.StringIO(file.stream.read().decode("utf-8"))
        reader = csv.DictReader(stream)

        transactions =[row for row in reader]
        return transactions
    except Exception as e:
        print(f"CSV parsing error: {e}")
        return []

    