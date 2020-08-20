import pandas as pd

for i in range(20):
    filename = f"z{i}"

    csv_file = pd.DataFrame(pd.read_csv(f"{filename}.csv", sep = ",", header = 0, index_col = False))
    csv_file.to_json(f"{filename}.json", orient = "records", date_format = "epoch", double_precision = 10, force_ascii = True, date_unit = "ms", default_handler = None)