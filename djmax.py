from xlrd import open_workbook
import json

wb = open_workbook('DJMAX.xlsx')

sheet = wb.sheet_by_index(0)

first_row = sheet.row_values(0)
version_name = "FINAL"

print(sheet.nrows)

styles = ["4B", "5B", "6B", "8B"]
diffs = ["NM", "HD", "MX"]
songs = []

for row in range(1, sheet.nrows):
    print(row)
    version = sheet.cell_value(row, 0)
    title = sheet.cell_value(row, 1)
    artist = sheet.cell_value(row, 2)
    offset = 3
    for key_mode in range(0, 4):
        style = styles[key_mode]
        for diff in range(0, 3):
            difficulty = diffs[diff]
            column = offset + (3 * key_mode) + (diff)
            level = sheet.cell_value(row, column)
            if(level != ""):
                obj = {
                    "title": title,
                    "artist": artist,
                    "version": version,
                    "style": style,
                    "difficulty": diff,
                    "level": int(level)
                }
                songs.append(obj)

final_data = {
    "id": "djmax",
    "songs": songs
}
#remember to change the datetime to the one from the page, not on the date it was update on the app's server
with open('games/djmax/respect/' +  version_name + '.json', 'w', encoding='utf8') as file:
    json.dump(final_data, file, indent=2, sort_keys=True)
print ("Finished")
