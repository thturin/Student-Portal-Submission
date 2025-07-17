#!/bin/bash

#get repo path from argument
repo_path=$1

#move into cloned repo folder
cd "$repo_path"

# #compile all java files 
# javac *.java

#run Gradle tests
if [ -f "./gradlew"]; then
    ./gradlew test
else
    gradle test
fi

#check if gradle tests ran successfully 
if [$? -ne 0]; then
    echo "0" #return 0 if gradle test execution failed
    exit 1
fi

#parse test results to calculate score
test_results_dir="build/test-results/test"
if [-d "$test_results_dir"]; then
    total_tests=0
    passed_tests=0

    #loop through xml files in the test results directory
    for file in "$test_results_dir"/*.xml; do
        if [ -f "$file" ]; then
            #extract total and passed test counts from the XML
            total=$(grep -oP 'tests="\K[0-9]+' "$file")
            passed=$(grep -oP 'passed="\K[0-9]+' "$file")

            #add totals
            total_tests=$((total_tests + total))
            passed_tests=$((passed_tests + passed))
        fi
    done

    #calculate the score as a percentage
    if [ "$total_test" -gt 0]; then
        score=$((passed_tests * 100 / total_tests))
        echo "$score" # Output the calculated score
    else
        echo "0" #no tests found, return 0
    fi
else
    echo "0" #test result directory not found, return 0 
fi


# #check if compilation failed 
# if [$? -ne 0]; then 
#     echo "0" #return score 0 if compiled failed 
#     exit 1
# fi

# #run student code (assuming main class is Main)
# output =$(java main)

# #define expected output
# output="hello world"

# if["$output"=="$expected"]; then
#     echo "100" #full score 
# else 
#     echo "50" #partial credit for incorrect output
# fi