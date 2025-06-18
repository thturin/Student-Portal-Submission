#!/bin/bash

#get repo path from argument
repo_path=$1

#move into cloned repo folder
cd "$repo_path"

#compile all java files 
javac *.java

#check if compilation failed 
if [$? -ne 0]; then 
    echo "0" #return score 0 if compiled failed 
    exit 1
fi

#run student code (assuming main class is Main)
output =$(java main)

#define expected output
output="hello world"

if["$output"=="$expected"]; then
    echo "100" #full score 
else 
    echo "50" #partial credit for incorrect output
fi