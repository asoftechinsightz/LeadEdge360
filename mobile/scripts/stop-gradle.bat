@echo off
REM Stop Gradle daemons and release cache locks (Windows CMD).
setlocal
cd /d "%~dp0..\android"
if not exist gradlew.bat (
  echo ERROR: gradlew.bat not found at %cd%
  exit /b 1
)
echo Stopping Gradle daemons in %cd% ...
call gradlew.bat --stop
echo.
echo If build still says "journal cache locked", close Android Studio and run:
echo   taskkill /F /IM java.exe
echo Then retry: flutter build apk --release ...
endlocal
