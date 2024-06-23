export const MAX_EXECUTION_TIME : number = 30000; // 30 seconds 
export const MAX_MEMORY_USAGE : number = 1024 * 1024 * 1024; // 1 GB
export const EXECUTION_COMMANDS : { [key: string]: string | undefined } = {
    "py": "python3 ${file}",
    "cpp": "clang++ ${file} -o ${fileBase} && ${fileBase}",
    "java": "javac ${file} && java ${fileBase}",
    "c": "clang++ ${file} -o ${fileBase} && ${fileBase}",
};