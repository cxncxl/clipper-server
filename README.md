# Clipper server

API for Clipper services

see [clipper](https://github.com/cxncxl/clipper-service) -- cli tool for creating shorts from long content
see [clipper-client]() -- frontend part

## Workflow

1. Upload long video
    * Save video on drive, add entry to DB

2. Process video using clipper
    * Transcribe video
    * Find interesting moments using AI
    * Covert to 9:18 format
    * Add subtitles
    * Add ad banner (WIP)

3. Let user select good ones from clips (WIP)
    * Update AI's knowledge base on which are good and which are bad
    * Optionally manually update description
    * Optionally select version with/without subtitles

4. Add description and tags (WIP)
5. Put in upload queue

Other services:
1. Add/update ads (WIP)
2. Manage tags sets (WIP)
3. Upload video to platforms from queue (WIP)
4. Authorization (WIP)
5. Notifications (WIP)
6. Reports (WIP)
7. Video upscale (WIP)

