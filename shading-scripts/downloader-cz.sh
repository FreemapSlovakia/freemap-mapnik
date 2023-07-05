#!/bin/bash

parallel_downloader() {
    url = "https://openzu.cuzk.cz/opendata/DMR5G/epsg-5514/$1.zip"
    output_file = "$1.zip"
    echo "Downloading $url"
    curl - O $url - o $output_file
    echo "Download complete: $output_file"
}

# Set the input file containing filenames
input_file = "list"
max_workers = 6

# Read filenames from the input file
filenames = ()
while IFS = read - r filename
do
    filenames += ("$filename")
done < "$input_file"

# Create an array to store the background process IDs
pids = ()

# Iterate over the filenames and limit the parallelism
for filename in "${filenames[@]}"
do
    parallel_downloader "$filename" &

    # Store the process ID of the last background process
    pids += ($!)

    # Limit the number of workers
    if ((${  # pids[@]} >= max_workers ))
    then
        # Wait for any background process to finish
        wait - n

        # Remove the finished process ID from the array
        pids=("${pids[@]:1}")
    fi
done

# Wait for all remaining background processes to finish
wait

echo "All downloads complete!"
