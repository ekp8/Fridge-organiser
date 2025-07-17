@echo off
REM Launch VS Code with increased memory allocation
REM Set Node.js memory limit to 4GB
set NODE_OPTIONS=--max-old-space-size=4096

REM Launch VS Code with the current directory
"C:\Users\%USERNAME%\AppData\Local\Programs\Microsoft VS Code\Code.exe" --max-memory=4096 "%CD%"

REM Alternative path if VS Code is installed system-wide
REM "C:\Program Files\Microsoft VS Code\Code.exe" --max-memory=4096 "%CD%"
