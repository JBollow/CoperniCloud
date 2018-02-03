@echo off
cd back-end
mkdir data

cd ..

cd %~dp1
start /min C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -File back-end\mongod.ps1

cd %~dp1
start /min C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -File back-end\back-end.ps1

cd %~dp1
start /min C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -File front-end\front-end.ps1

cd %~dp1
start /min C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -File py_imgProcessing\py_imgProcessing.ps1

cd %~dp1
start /min C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -File py_filesServer\py_filesServer.ps1

exit