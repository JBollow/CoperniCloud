@echo off

cd %~dp1
start /min C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -File .\front-end.ps1

exit