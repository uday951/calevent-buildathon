@echo off
echo Testing Hugging Face Only Setup...
echo ==================================

cd calevent-backend
node test-image-fix.js

echo.
echo Test complete! Should now use Hugging Face first.
pause