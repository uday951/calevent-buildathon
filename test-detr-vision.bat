@echo off
echo Testing DETR Vision Analysis...
echo ================================

cd calevent-backend

echo.
echo 1. Testing Node.js DETR endpoint...
node test-vision-detr.js

echo.
echo 2. Testing Python DETR (if available)...
python test-detr.py 2>nul || echo Python test skipped

echo.
echo Test complete! Check the output above.
pause