# cp-edge-case README

Effortlessly identify edge test cases where your code fails, which are often hidden on competitive programming platforms. This tool requires three files: one containing the code that generates incorrect output, another with the code producing the correct output, and a third file designed to generate test cases. It then automatically generates test cases where your code fails by comparing the output with the correct code, helping you pinpoint and address specific issues.

## Requirements

- **pidusage**: Version 3.0.2 or higher. This package is used for monitoring the process CPU and memory usage.
- **react**: Version 18.3.1 or higher. Required for projects using React.



## Settings

The CP Edge Case extension offers several settings to configure the execution environment for different programming languages. Below are the available settings:

### Max Execution Time

- **Key**: `cp-edge-case.Max Execution Time`
- **Type**: `number`
- **Default**: `5000`
- **Description**: Specifies the maximum time (in milliseconds) for which a file is executed before it is terminated. This helps in preventing infinite loops or excessively long-running processes.

### Max Memory Usage

- **Key**: `cp-edge-case.Max Memory Usage`
- **Type**: `number`
- **Default**: `1`
- **Description**: Sets the maximum memory allocation (in GB) for file execution. This setting helps in managing the memory usage of the programs being executed.

### Python Command

- **Key**: `cp-edge-case.Python command`
- **Type**: `string`
- **Default**: `python`
- **Description**: Defines the command to execute Python files. You can customize it to your Python interpreter command (`python3`, `py`, etc.).

### CPP Command

- **Key**: `cp-edge-case.CPP command`
- **Type**: `string`
- **Default**: `g++`
- **Description**: Specifies the command to compile and execute C++ files. You can change it according to the C++ compiler you use (`clang++`, etc.).

### C Command

- **Key**: `cp-edge-case.C command`
- **Type**: `string`
- **Default**: `gcc`
- **Description**: Determines the command to compile and execute C files. This can be customized to use a different C compiler (`clang`, etc.).

### Java Command

- **Key**: `cp-edge-case.Java command`
- **Type**: `string`
- **Default**: `javac ${file} && java ${fileBase}`
- **Description**: Provides the command to compile and execute Java files. This setting is particularly useful for specifying the Java compiler and execution commands in one go.

## How to Configure Settings

You can configure these settings directly in your Visual Studio Code settings.json file or through the Settings UI under the Extensions category.

For more information on how to edit settings, refer to the [Visual Studio Code documentation](https://code.visualstudio.com/docs/getstarted/settings).
