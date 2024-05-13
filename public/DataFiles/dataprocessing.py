import csv

# Paths to input and output files
input_file_path = 'D:/mapbox_proj/my-app/public/DataFiles/ships.csv'
output_file_path = 'D:/mapbox_proj/my-app/public/DataFiles/first_100000_ships.csv'

# Open the input CSV file
with open(input_file_path, newline='') as input_file:
    reader = csv.reader(input_file)
    
    # Open the output CSV file for writing
    with open(output_file_path, 'w', newline='') as output_file:
        writer = csv.writer(output_file)
        
        # Write the header row to the output file
        writer.writerow(['Ship_ID', 'Latitude', 'Longitude', 'Direction', 'Time'])
        
        # Write the first 100,000 entries to the output file
        for _ in range(100000):
            try:
                row = next(reader)
                writer.writerow(row)
            except StopIteration:
                break  # Stop if there are fewer than 100,000 entries in the input file
