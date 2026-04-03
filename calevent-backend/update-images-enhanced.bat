@echo off
color 0A
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║        CALEVENT - Enhanced Event Image Updater            ║
echo ║                                                            ║
echo ║  This will update ALL event images with free images from: ║
echo ║  • Unsplash (High-quality professional photos)            ║
echo ║  • Pexels   (Free stock photography)                      ║
echo ║  • Pixabay  (Free images and videos)                      ║
echo ║                                                            ║
echo ║  All images are:                                          ║
echo ║  ✓ Completely FREE to use                                 ║
echo ║  ✓ High quality (1200px)                                  ║
echo ║  ✓ Safe and licensed                                      ║
echo ║  ✓ No attribution required                                ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Press any key to start updating images...
pause > nul
echo.

node update-event-images-enhanced.js

echo.
echo ════════════════════════════════════════════════════════════
echo Update complete! Check the output above for details.
echo ════════════════════════════════════════════════════════════
echo.
pause
