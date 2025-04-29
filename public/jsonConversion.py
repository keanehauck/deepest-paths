import pandas as pd
import json
import re
import os

# Read the JSON file into a Python dictionary
with open('D:/Dropbox/Side Projects/Deeper Paths/Deeper.json') as f:
    data = json.load(f)

# Create a dictionary to hold the flattened data
flat_data = {}

# Iterate over the users
for user_id, user_data in data['users'].items():
    # Flatten the user data
    flat_user_data = {}
    for key, value in user_data.items():
        if isinstance(value, dict):
            for sub_key, sub_value in value.items():
                flat_user_data[f"{key}_{sub_key}"] = sub_value
        else:
            flat_user_data[key] = value
    # Add the flattened user data to the dictionary
    flat_data[user_id] = flat_user_data

# Convert the dictionary into a Pandas dataframe
df = pd.DataFrame.from_dict(flat_data, orient='index')

# Custom sorting function to sort column names based on the prefix and numerical suffix
def custom_sort(col_name):
    prefix = re.findall(r'^(.*?_Game)', col_name)
    suffix = re.findall(r'\d+', col_name)
    return (prefix[0] if prefix else '', int(suffix[0]) if suffix else 0)

# Sort the columns using the custom sorting function
sorted_columns = sorted(df.columns, key=custom_sort)

# Reorder the DataFrame using the sorted columns
df = df[sorted_columns]

# Write the dataframe to a CSV file
df.to_csv(r'D:/Dropbox/Side Projects/Deeper Paths/output.csv', index=False)
print("Output file saved to:", os.path.abspath('output.csv'))import pandas as pd
import json
import re
import os

# Read the JSON file into a Python dictionary
with open('D:/Dropbox/Side Projects/Deeper Paths/Deeper.json') as f:
    data = json.load(f)

# Create a dictionary to hold the flattened data
flat_data = {}

# Iterate over the users
for user_id, user_data in data['users'].items():
    # Flatten the user data
    flat_user_data = {}
    for key, value in user_data.items():
        if isinstance(value, dict):
            for sub_key, sub_value in value.items():
                flat_user_data[f"{key}_{sub_key}"] = sub_value
        else:
            flat_user_data[key] = value
    # Add the flattened user data to the dictionary
    flat_data[user_id] = flat_user_data

# Convert the dictionary into a Pandas dataframe
df = pd.DataFrame.from_dict(flat_data, orient='index')

# Custom sorting function to sort column names based on the prefix and numerical suffix
def custom_sort(col_name):
    prefix = re.findall(r'^(.*?_Game)', col_name)
    suffix = re.findall(r'\d+', col_name)
    return (prefix[0] if prefix else '', int(suffix[0]) if suffix else 0)

# Sort the columns using the custom sorting function
sorted_columns = sorted(df.columns, key=custom_sort)

# Reorder the DataFrame using the sorted columns
df = df[sorted_columns]

# Write the dataframe to a CSV file
df.to_csv(r'D:/Dropbox/Side Projects/Deeper Paths/output.csv', index=False)
print("Output file saved to:", os.path.abspath('output.csv'))