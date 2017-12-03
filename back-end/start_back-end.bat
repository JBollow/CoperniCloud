@echo off
cd %~dp1
mkdir data

cd %~dp1
start /min C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -File .\mongod.ps1

cd %~dp1
start /min C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -File .\back-end.ps1

exit