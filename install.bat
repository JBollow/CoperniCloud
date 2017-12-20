@echo off
cd back-end
call install_back-end.bat

cd ..
cd front-end
call install_front-end.bat

exit