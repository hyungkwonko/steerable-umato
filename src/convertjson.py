import pandas as pd

csv_file = pd.DataFrame(pd.read_csv("umato-small_1.csv", sep = ",", header = 0, index_col = False))
csv_file.to_json("umato_small_1.json", orient = "records", date_format = "epoch", double_precision = 10, force_ascii = True, date_unit = "ms", default_handler = None)